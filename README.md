# Deep Learning - Universidad de Medellín 2026

Repositorio del curso de Deep Learning dictado en la Universidad de Medellín, 2026.

## Contenido del Curso

| Semana | Tema | Descripción |
|--------|------|-------------|
| 1 | Redes Multicapa (MLP) | Perceptrón simple y multicapa, retropropagación, introducción a Keras/TensorFlow |
| 2 | Redes Convolucionales (CNN) | Convoluciones, pooling, arquitecturas clásicas (LeNet, VGG, ResNet) |
| 3 | Redes Recurrentes (RNN) | RNN, LSTM, GRU, aplicaciones en series de tiempo y texto |

## Estructura del Repositorio

```
Deep-Learning-Course-UdeMedellin-2026/
├── Semana_01_Redes_Multicapa/
│   ├── docs/         # Presentaciones y PDFs de clase
│   ├── notebooks/    # Notebooks de práctica
│   └── tarea/        # Enunciado y archivos de la tarea
├── Semana_02_Redes_Convolucionales/
│   ├── docs/
│   ├── notebooks/
│   └── tarea/
├── Semana_03_Redes_Recurrentes/
│   ├── docs/
│   ├── notebooks/
│   └── tarea/
└── src/              # Utilidades comunes
```

## Instalación

### Con pip
```bash
pip install tensorflow numpy matplotlib scikit-learn jupyter
```

### Con conda
```bash
conda create -n deep-learning python=3.11
conda activate deep-learning
conda install tensorflow numpy matplotlib scikit-learn jupyter
```

### Verificar instalación
```python
import tensorflow as tf
print(tf.__version__)
```
