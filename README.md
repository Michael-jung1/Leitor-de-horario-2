# 📚 Leitor de Horários Escolares (Urânia PDF)

Extrator inteligente e visualizador de grade horária escolar a partir de PDFs gerados pelo software Urânia.

## 🚀 Como Rodar Localmente

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Inicie a aplicação Streamlit:
```bash
streamlit run leitor_horario.py
```

---

## ☁️ Como Fazer o Deploy no Streamlit Community Cloud (Grátis)

1. **Suba o projeto no seu repositório GitHub** (`Michael-jung1/leitor-horarios-escola`):
   ```bash
   git add .
   git commit -m "feat: melhorias no leitor de horarios"
   git push origin main
   ```

2. **Acesse o Streamlit Community Cloud**:
   - Entre em [share.streamlit.io](https://share.streamlit.io)
   - Faça login com sua conta do GitHub.

3. **Crie o novo App**:
   - Clique em **"New app"**.
   - **Repository:** `Michael-jung1/leitor-horarios-escola`
   - **Branch:** `main` (ou `master`)
   - **Main file path:** `leitor_horario.py`
   - **App URL:** escolha um subdomínio personalizado (opcional).

4. Clique em **"Deploy!"**.
   - O Streamlit instalará automaticamente os pacotes listados no `requirements.txt` (`streamlit`, `pandas`, `pdfplumber`) e colocará o app no ar em segundos!
