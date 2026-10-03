import re
import streamlit as st
import pandas as pd
import pdfplumber

# Dicionário inteligente atualizado com as matérias do PDF
SIGLAS = {
    'BIO': 'Biologia', 'ED.F': 'Ed. Física', 'ED.F.': 'Ed. Física',
    'PORT': 'Português', 'ART': 'Artes', 'MAT': 'Matemática',
    'GEO': 'Geografia', 'SOC': 'Sociologia', 'HIST': 'História',
    'FIL': 'Filosofia', 'ING': 'Inglês', 'FIS': 'Física',
    'QUI': 'Química', 'ESP': 'Espanhol', 'BIOLOGIA': 'Biologia'
}

TURMAS_PADRAO = [
    "104", "105", "106", "107", "108", "109",
    "206", "207", "208", "209",
    "305", "306"
]

def parse_cell(texto, siglas_desconhecidas=None):
    linhas = [x.strip() for x in str(texto).split('\n') if x.strip()]
    pares = []
    materia_atual = None
    prof_atual = []
    
    for linha in linhas:
        palavras = linha.split(" ")
        sigla = palavras[0].upper()
        
        # Verifica se é uma sigla conhecida ou LIVRE
        if sigla in SIGLAS or sigla == "LIVRE":
            if materia_atual is not None:
                pares.append((materia_atual, " ".join(prof_atual).strip()))
            materia_atual = SIGLAS.get(sigla, "Livre")
            prof_atual = []
            
            resto = linha[len(palavras[0]):].strip()
            if resto:
                prof_atual.append(resto)
        # Se parecer uma sigla desconhecida (2 a 6 letras maiúsculas/pontos)
        elif re.match(r'^[A-Z.]{2,6}$', sigla):
            if materia_atual is not None:
                pares.append((materia_atual, " ".join(prof_atual).strip()))
            materia_atual = sigla
            if siglas_desconhecidas is not None:
                siglas_desconhecidas.add(sigla)
            prof_atual = []
            
            resto = linha[len(palavras[0]):].strip()
            if resto:
                prof_atual.append(resto)
        else:
            if materia_atual is not None:
                prof_atual.append(linha)
            else:
                pares.append(("", linha))
                
    if materia_atual is not None:
        pares.append((materia_atual, " ".join(prof_atual).strip()))
        
    return pares

def extrair_turmas_do_pdf(arquivo_pdf):
    turmas_encontradas = set()
    try:
        arquivo_pdf.seek(0)
        with pdfplumber.open(arquivo_pdf) as pdf:
            for page in pdf.pages:
                texto = page.extract_text()
                if texto:
                    turmas = re.findall(r"Turma:\s*(\S+)", texto)
                    for t in turmas:
                        t_limpo = t.strip()
                        if t_limpo:
                            turmas_encontradas.add(t_limpo)
        arquivo_pdf.seek(0)
    except Exception as e:
        st.error(f"Erro ao ler turmas do PDF: {e}")
    return sorted(list(turmas_encontradas))

def extrair_horario_inteligente(arquivo_pdf, turma_alvo):
    dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
    horarios_padrao = ["13:00", "13:45", "14:30", "15:30", "16:15", "17:00"]
    
    grade = {h: {d: {"materia": "Livre", "prof": ""} for d in dias} for h in horarios_padrao}
    siglas_desconhecidas = set()
    
    arquivo_pdf.seek(0)
    with pdfplumber.open(arquivo_pdf) as pdf:
        for page in pdf.pages:
            texto = page.extract_text()
            # 1. Filtra a página usando busca por regex com limite de palavra
            if not texto or not re.search(rf"Turma:\s*{re.escape(turma_alvo)}\b", texto):
                continue
            
            tabelas = page.extract_tables()
            
            # Divide o texto da página por "Turma:" para encontrar o bloco da turma correta
            blocos_turma = texto.split("Turma:")
            indice_tabela_alvo = -1
            
            # Conta as tabelas válidas encontradas
            tabelas_validas = [t for t in tabelas if t and t[0] and "Hor" in str(t[0][0])]
            
            # 1. Localiza o bloco da turma usando regex com limite de palavra
            for i, bloco in enumerate(blocos_turma[1:]): # Ignora o texto antes da primeira turma
                 if re.search(rf"^\s*{re.escape(turma_alvo)}\b", bloco):
                     indice_tabela_alvo = i
                     break
                      
            if indice_tabela_alvo != -1 and indice_tabela_alvo < len(tabelas_validas):
                tabela_alvo = tabelas_validas[indice_tabela_alvo]
            else:
                continue # Se não achou a tabela correspondente, continua a busca
                
            current_times = []
            for linha in tabela_alvo[1:]: # Processa a tabela encontrada
                texto_horario = str(linha[0]).strip() if linha[0] else ""
                horarios_na_linha = [h.strip() for h in texto_horario.split("\n") if ":" in h]
                
                is_continuation = False
                if horarios_na_linha:
                    current_times = horarios_na_linha
                else:
                    is_continuation = True
                    
                for i, dia in enumerate(dias):
                    col = i + 1
                    celula = str(linha[col]) if col < len(linha) and linha[col] else ""
                    pares = parse_cell(celula, siglas_desconhecidas)
                    
                    if is_continuation:
                        for idx, (sub, prof) in enumerate(pares):
                            if idx < len(current_times) and prof:
                                h = current_times[idx]
                                grade[h][dia]["prof"] = (grade[h][dia]["prof"] + " " + prof).strip()
                    else:
                        for idx, (sub, prof) in enumerate(pares):
                            if idx < len(current_times):
                                h = current_times[idx]
                                if sub: grade[h][dia]["materia"] = sub
                                if prof: grade[h][dia]["prof"] = prof
                                    
            resultado = []
            for h in horarios_padrao:
                linha_formatada = {"Horário": h}
                for d in dias:
                    mat = grade[h][d]["materia"]
                    prof = grade[h][d]["prof"]
                    if mat == "Livre" or not mat:
                        linha_formatada[d] = "Livre"
                    else:
                        p_nome = prof.title() if prof else "Não Informado"
                        linha_formatada[d] = f"{mat} | {p_nome}"
                resultado.append(linha_formatada)
            
            return pd.DataFrame(resultado), siglas_desconhecidas
            
    return None, siglas_desconhecidas

st.set_page_config(page_title="Leitor de Horário Escolar", layout="centered")
st.link_button("⬅️ Voltar para o App Principal", "https://app-escola-phi.vercel.app/")

st.title("📚 Extrator de Horários Automático")
st.write("Arraste seu PDF gerado pelo Urania. O sistema mapeará as matérias e os professores perfeitamente.")

arquivo_enviado = st.file_uploader("Arraste e solte o seu PDF aqui", type=["pdf"])

# 2. Lista de turmas lida dinamicamente do PDF com cache em st.session_state
if arquivo_enviado is not None:
    file_key = f"{arquivo_enviado.name}_{arquivo_enviado.size}"
    if st.session_state.get("last_file_key") != file_key or "turmas_opcoes" not in st.session_state:
        with st.spinner("Detectando turmas no PDF..."):
            turmas_detectadas = extrair_turmas_do_pdf(arquivo_enviado)
            st.session_state["turmas_opcoes"] = turmas_detectadas if turmas_detectadas else TURMAS_PADRAO
            st.session_state["last_file_key"] = file_key
    opcoes_turma = st.session_state.get("turmas_opcoes", TURMAS_PADRAO)
else:
    opcoes_turma = TURMAS_PADRAO
    if "turmas_opcoes" in st.session_state:
        del st.session_state["turmas_opcoes"]
    if "last_file_key" in st.session_state:
        del st.session_state["last_file_key"]

turma_selecionada = st.selectbox("Selecione sua Turma:", opcoes_turma)

if st.button("Extrair Meu Horário"):
    if arquivo_enviado is not None:
        with st.spinner('Analisando as grades do PDF...'):
            df_horario, siglas_desconhecidas = extrair_horario_inteligente(arquivo_enviado, turma_selecionada)
            
            if df_horario is not None and not df_horario.empty:
                st.success(f"🎉 Horário da Turma {turma_selecionada} mapeado com sucesso!")
                st.dataframe(df_horario, use_container_width=True)
                
                # 3. Aviso se houver siglas não reconhecidas
                if siglas_desconhecidas:
                    siglas_fmt = ", ".join(sorted(siglas_desconhecidas))
                    st.warning(f"Siglas não reconhecidas: {siglas_fmt}. Confira o resultado e avise o desenvolvedor para incluí-las.")
                
                st.download_button(
                    label="Baixar em JSON para o App",
                    data=df_horario.to_json(orient="records", force_ascii=False),
                    file_name=f"horario_turma_{turma_selecionada}.json",
                    mime="application/json"
                )
            else:
                st.error("Turma não encontrada ou PDF com formato inválido.")
    else:
        st.warning("Envie o arquivo PDF primeiro!")
