# CLAUDE.md — Deep Learning Course UdeMedellin 2026

Guía para instancias de Claude Code que trabajen en este repositorio.

## Entorno y dependencias

**Stack principal:** Python 3.11, TensorFlow, NumPy, Matplotlib, scikit-learn, Jupyter.

Crear entorno con conda (recomendado):
```bash
conda create -n deep-learning python=3.11
conda activate deep-learning
conda install tensorflow numpy matplotlib scikit-learn jupyter
```

O con pip:
```bash
pip install tensorflow numpy matplotlib scikit-learn jupyter
```

Verificar instalación:
```python
import tensorflow as tf
print(tf.__version__)
```

## Estructura del proyecto

```
Deep-Learning-Course-UdeMedellin-2026/
├── Semana_01_Redes_Multicapa/
│   ├── docs/       # Presentaciones y PDFs
│   ├── notebooks/  # Notebooks de práctica
│   └── tarea/      # Enunciado y archivos de tarea
├── Semana_02_Redes_Convolucionales/
│   ├── docs/
│   ├── notebooks/
│   └── tarea/
├── Semana_03_Redes_Recurrentes/
│   ├── docs/
│   ├── notebooks/
│   └── tarea/
└── src/            # Utilidades comunes compartidas entre semanas
```

**Temas por semana:**
- Semana 1 — MLP: perceptrón, retropropagación, Keras/TensorFlow
- Semana 2 — CNN: convoluciones, pooling, LeNet/VGG/ResNet
- Semana 3 — RNN: LSTM, GRU, series de tiempo y texto

## Flujo de trabajo con notebooks

Iniciar Jupyter desde la raíz del repositorio:
```bash
jupyter notebook
```

Los notebooks de práctica viven en `Semana_0X_*/notebooks/`. Los checkpoints de Jupyter (`.ipynb_checkpoints/`) están en `.gitignore` — no versionar.

## Convenciones del repositorio

- **Idioma:** Español para documentación, comentarios y commits. Código e identificadores en inglés.
- **Naming de carpetas:** `Semana_0X_Nombre_Tema/` (snake_case con mayúscula inicial).
- **No versionar:** datasets (`.csv`, `.h5`, `.pkl`, `.npy`, `.npz`), carpetas `data/`, entornos virtuales (`venv/`, `.venv/`, `env/`), artefactos de Python (`__pycache__/`, `*.pyc`).
- **`src/`** es para utilidades compartidas entre semanas; evitar duplicar código en cada carpeta semanal.
