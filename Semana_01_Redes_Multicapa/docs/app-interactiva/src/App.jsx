import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    RotateCcw,
    Settings2,
    Network,
    Code,
    Calculator,
    Activity,
    ArrowRight,
    ArrowLeft,
    Info,
    TrendingUp,
    Brain,
    Layers,
    Zap,
    BookOpen,
    Youtube,
    AlertCircle,
    GitMerge,
    PlusCircle,
    Library,
    Trash2,
    Image as ImageIcon,
    MessageSquare,
    Target,
    Rocket
} from 'lucide-react';

// --- COLORES INSTITUCIONALES (Basado en Universidad de Medellín) ---
const theme = {
    primary: '#c8102e', // Rojo UdeM
    primaryHover: '#a00d25',
    bgLight: '#f9fafb',
    textDark: '#1f2937',
    textGray: '#4b5563',
    border: '#e5e7eb',
    accent: '#3b82f6' // Azul para contrastes o inputs
};

// --- COMPONENTES AUXILIARES ---

// Renderizador de Ecuaciones simples
const MathEquation = ({ children }) => (
    <div className="font-serif text-lg tracking-wider bg-white px-4 py-2 rounded shadow-sm border border-gray-200 inline-block">
        {children}
    </div>
);

// Componente base para dibujar Redes Neuronales en SVG
const NeuralNetworkSVG = ({
    layers = [2, 4, 4, 1],
    activeLayer = -1,
    isBackward = false,
    onNodeHover = () => { },
    hoveredLayer = null,
    colorMode = 'default'
}) => {
    const width = 500;
    const height = 300;
    const padding = 40;

    const layerSpacing = layers.length > 1 ? (width - padding * 2) / (layers.length - 1) : 0;

    // Calcular un radio dinámico para evitar que las neuronas se superpongan si hay muchas
    const maxNodes = Math.max(...layers, 1);
    const nodeRadius = Math.min(12, ((height - padding * 2) / maxNodes) * 0.4);

    const nodes = [];
    const edges = [];

    // Generar nodos distribuyendo equitativamente en toda la altura disponible
    layers.forEach((nodeCount, layerIndex) => {
        const x = padding + layerIndex * layerSpacing;
        const currentLayerSpacing = nodeCount > 1 ? (height - padding * 2) / (nodeCount - 1) : 0;
        const startY = nodeCount > 1 ? padding : height / 2;

        for (let i = 0; i < nodeCount; i++) {
            const y = startY + i * currentLayerSpacing;
            nodes.push({ id: `l${layerIndex}-n${i}`, layer: layerIndex, x, y });
        }
    });

    // Generar conexiones
    for (let l = 0; l < layers.length - 1; l++) {
        const currentLayerNodes = nodes.filter(n => n.layer === l);
        const nextLayerNodes = nodes.filter(n => n.layer === l + 1);

        currentLayerNodes.forEach(source => {
            nextLayerNodes.forEach(target => {
                edges.push({ source, target, layer: l });
            });
        });
    }

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'hidden' }}
        >
            {/* Conexiones */}
            {edges.map((edge, i) => {
                let isAnimated = false;
                let strokeColor = '#e5e7eb'; // Default gray

                if (!isBackward) {
                    // Forward pass
                    if (activeLayer === edge.layer + 1) {
                        isAnimated = true;
                        strokeColor = theme.accent;
                    } else if (activeLayer > edge.layer + 1) {
                        strokeColor = '#bfdbfe'; // light blue
                    }
                } else {
                    // Backward pass
                    if (activeLayer === edge.layer) {
                        isAnimated = true;
                        strokeColor = theme.primary;
                    } else if (activeLayer < edge.layer && activeLayer !== -1) {
                        strokeColor = '#fecaca'; // light red
                    }
                }

                // Highlight based on external hover state
                if (hoveredLayer !== null) {
                    if (hoveredLayer === 'input' && edge.layer === 0) strokeColor = theme.primary;
                    if (hoveredLayer === 'hidden1' && edge.layer === 1) strokeColor = theme.primary;
                    if (hoveredLayer === 'hidden2' && edge.layer === 2) strokeColor = theme.primary;
                }

                return (
                    <line
                        key={`e-${i}`}
                        x1={edge.source.x}
                        y1={edge.source.y}
                        x2={edge.target.x}
                        y2={edge.target.y}
                        stroke={strokeColor}
                        strokeWidth={isAnimated || (hoveredLayer !== null && strokeColor === theme.primary) ? 3 : 1.5}
                        className={`transition-all duration-300 ${isAnimated ? (isBackward ? 'animate-pulse-fast reverse-dash' : 'animate-pulse-fast') : ''}`}
                        strokeDasharray={isAnimated ? "5,5" : "none"}
                    />
                );
            })}

            {/* Nodos */}
            {nodes.map((node, i) => {
                let fill = '#ffffff';
                let stroke = '#d1d5db';

                // 1. Colores Base
                if (colorMode === 'architecture' || colorMode === 'colored') {
                    if (node.layer === 0) {
                        fill = '#dcfce7'; stroke = '#16a34a'; // Entrada: Verde
                    } else if (node.layer === layers.length - 1) {
                        fill = '#ffedd5'; stroke = '#ea580c'; // Salida: Naranja
                    } else {
                        fill = '#eff6ff'; stroke = '#2563eb'; // Ocultas: Azul
                    }
                }

                // 2. Override Animaciones
                if (activeLayer !== -1) {
                    if (!isBackward && activeLayer >= node.layer) {
                        fill = activeLayer === node.layer ? '#eff6ff' : fill;
                        stroke = theme.accent;
                    }
                    if (isBackward && activeLayer <= node.layer) {
                        fill = activeLayer === node.layer ? '#fef2f2' : fill;
                        stroke = theme.primary;
                    }
                }

                // Estilos de Hover
                let isHovered = false;
                if (hoveredLayer === 'input' && node.layer === 0) isHovered = true;
                if (hoveredLayer === 'hidden1' && node.layer === 1) isHovered = true;
                if (hoveredLayer === 'hidden2' && node.layer === 2) isHovered = true;
                if (hoveredLayer === 'output' && node.layer === 3) isHovered = true;

                if (isHovered) {
                    stroke = theme.primary;
                    fill = '#fef2f2';
                }

                const getLayerName = (idx) => {
                    if (idx === 0) return 'input';
                    if (idx === 1) return 'hidden1';
                    if (idx === 2) return 'hidden2';
                    if (idx === 3) return 'output';
                    return null;
                };

                return (
                    <circle
                        key={`n-${i}`}
                        cx={node.x}
                        cy={node.y}
                        r={nodeRadius}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isHovered || (activeLayer === node.layer) ? 3 : 2}
                        className="transition-colors duration-300 cursor-pointer hover:shadow-lg"
                        onMouseEnter={() => onNodeHover(getLayerName(node.layer))}
                        onMouseLeave={() => onNodeHover(null)}
                    />
                );
            })}
        </svg>
    );
};

// --- PESTAÑAS PRINCIPALES ---

const TabIntro = () => {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header Introductorio */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-red-600" />
                    ¿Qué es el Deep Learning?
                </h2>
                <p className="text-gray-600 text-justify">
                    El <strong>Deep Learning (Aprendizaje Profundo)</strong> es el subcampo más avanzado del Machine Learning. Se basa en Redes Neuronales Artificiales con múltiples "capas ocultas" que le permiten aprender representaciones jerárquicas de los datos. Su mayor superpoder radica en su capacidad para trabajar directamente con <strong>Datos Crudos (Raw Data)</strong>, eliminando en gran medida la necesidad de la extracción e ingeniería manual de características.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* El Ecosistema IA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 z-10 w-full border-b pb-2">El Ecosistema de la IA</h3>
                    <div className="w-full max-w-sm flex-grow flex items-center justify-center p-4">
                        <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-sm">
                            {/* IA */}
                            <circle cx="200" cy="200" r="180" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                            <text x="200" y="55" textAnchor="middle" className="font-bold text-sm fill-gray-500">Inteligencia Artificial (IA)</text>
                            {/* ML */}
                            <circle cx="200" cy="230" r="140" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="2" />
                            <text x="200" y="125" textAnchor="middle" className="font-bold text-sm fill-blue-700">Machine Learning (ML)</text>
                            {/* DL */}
                            <circle cx="200" cy="260" r="100" fill="#fee2e2" stroke="#fca5a5" strokeWidth="2" />
                            <text x="200" y="195" textAnchor="middle" className="font-bold text-sm fill-red-700">Deep Learning (DL)</text>
                            {/* LLM / GenAI */}
                            <circle cx="200" cy="290" r="60" fill="#ffedd5" stroke="#fdba74" strokeWidth="2" />
                            <text x="200" y="295" textAnchor="middle" className="font-bold text-xs fill-orange-800">LLMs / GenAI</text>
                        </svg>
                    </div>
                </div>

                {/* DL vs ML Clásico */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center gap-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">El Cambio de Paradigma: Raw Data</h3>

                    {/* ML Clásico */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Machine Learning Tradicional</span>
                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 text-sm text-gray-700 font-medium">
                            <div className="bg-white p-2 rounded border border-gray-300 text-center w-full sm:flex-1">Datos Crudos<br /><span className="text-[10px] font-normal text-gray-500">(Ej. Pixeles, Audio)</span></div>
                            <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block flex-shrink-0" />
                            <div className="bg-blue-100 p-2 rounded border border-blue-300 text-center w-full sm:flex-1 text-blue-900">Ingeniería de Features<br /><span className="text-[10px] font-normal text-blue-700">(Extracción Manual)</span></div>
                            <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block flex-shrink-0" />
                            <div className="bg-white p-2 rounded border border-gray-300 text-center w-full sm:flex-1">Modelo<br /><span className="text-[10px] font-normal text-gray-500">(Clasificador simple)</span></div>
                        </div>
                    </div>

                    {/* Deep Learning */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Deep Learning
                        </span>
                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 text-sm text-gray-700 font-medium">
                            <div className="bg-white p-2 rounded border border-gray-300 text-center w-full sm:w-1/4">Datos Crudos<br /><span className="text-[10px] font-normal text-gray-500">(Raw Data)</span></div>
                            <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block flex-shrink-0" />
                            <div className="bg-red-100 p-3 rounded border border-red-300 text-center w-full sm:flex-1 text-red-900 shadow-inner">
                                Red Neuronal Profunda<br />
                                <span className="text-[10px] font-normal text-red-700">(Aprende las características <strong>Y</strong> clasifica automáticamente)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aplicaciones */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Aplicaciones y Dominios Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-l-4 border-l-blue-500 flex gap-4 items-start">
                        <div className="bg-blue-100 p-3 rounded-lg"><ImageIcon className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-800">Dominio Espacial (Imágenes/Video)</h4>
                            <p className="text-sm text-gray-600 mt-1">El DL revolucionó la <strong>Visión Computacional</strong>. Al procesar matrices de pixeles en su estado puro, logró hazañas como el Diagnóstico Médico automatizado, el reconocimiento facial y es el motor principal detrás de la conducción autónoma.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-l-4 border-l-orange-500 flex gap-4 items-start">
                        <div className="bg-orange-100 p-3 rounded-lg"><MessageSquare className="w-6 h-6 text-orange-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-800">Dominio Secuencial (Texto/Tiempo/Audio)</h4>
                            <p className="text-sm text-gray-600 mt-1">Procesamiento de datos donde el orden importa. Transformó el <strong>Procesamiento de Lenguaje Natural (NLP)</strong> y las Series Temporales. Es la tecnología que da vida a traductores en tiempo real, asistentes de voz y grandes modelos de lenguaje (LLMs) como ChatGPT.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tab1Perceptron = () => {
    const [x1, setX1] = useState(1);
    const [x2, setX2] = useState(0);
    const [w1, setW1] = useState(0.5);
    const [w2, setW2] = useState(-0.5);
    const [b, setB] = useState(0);
    const [activation, setActivation] = useState('escalon');

    const z = (x1 * w1) + (x2 * w2) + b;
    let y = 0;
    if (activation === 'escalon') {
        y = z >= 0 ? 1 : 0;
    } else {
        y = 1 / (1 + Math.exp(-z)); // Sigmoide
    }

    // Generar puntos para la malla de la barrera de decisión
    const decisionPoints = [];
    for (let px = -5; px <= 5; px += 0.5) {
        for (let py = -5; py <= 5; py += 0.5) {
            const ptZ = px * w1 + py * w2 + b;
            let ptY = 0;
            if (activation === 'escalon') {
                ptY = ptZ >= 0 ? 1 : 0;
            } else {
                ptY = 1 / (1 + Math.exp(-ptZ));
            }
            decisionPoints.push({ px, py, ptY });
        }
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Definición y Ecuación */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">El Perceptrón Simple</h2>
                <p className="text-gray-600 mb-4">
                    El perceptrón es la unidad conceptual básica de las redes neuronales artificiales.
                    Actúa como un <strong>clasificador binario lineal</strong>: toma múltiples señales de entrada,
                    les asigna una importancia matemática (pesos), suma una tendencia intrínseca (sesgo) y finalmente
                    decide si "se activa" o no, utilizando una función de activación.
                </p>
                <div className="flex flex-col md:flex-row items-center gap-6 justify-center bg-gray-50 p-4 rounded-lg">
                    <MathEquation>
                        z = <span className="text-red-600">w₁</span>x₁ + <span className="text-red-600">w₂</span>x₂ + <span className="text-yellow-600">b</span>
                    </MathEquation>
                    <span className="text-gray-400 font-bold">➔</span>
                    <MathEquation>
                        ŷ = f(z)
                    </MathEquation>
                </div>
            </div>

            {/* Metáfora Biológica */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-6 items-center shadow-sm">
                <div className="w-full md:w-1/3 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-blue-200 pb-4 md:pb-0 md:pr-4">
                    <Brain className="w-12 h-12 text-blue-600 mb-2" />
                    <h3 className="font-bold text-lg text-blue-900">Inspiración Biológica</h3>
                    <p className="text-xs text-blue-800 mt-2 text-justify">
                        En 1957, Frank Rosenblatt diseñó el perceptrón intentando imitar matemáticamente cómo procesa la información una neurona biológica real en nuestro cerebro.
                    </p>
                </div>
                <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                        <span className="font-bold text-sm text-blue-700">Dendritas ➔ Entradas (x)</span>
                        <p className="text-xs text-gray-600 mt-1">Las ramificaciones que reciben señales, estímulos externos o datos de otras neuronas.</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                        <span className="font-bold text-sm text-red-700">Sinapsis ➔ Pesos (w)</span>
                        <p className="text-xs text-gray-600 mt-1">La "fuerza" de la conexión entre neuronas. Ajustar estos pesos es lo que llamamos "aprender".</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                        <span className="font-bold text-sm text-blue-700">Soma ➔ Suma (Σ)</span>
                        <p className="text-xs text-gray-600 mt-1">El cuerpo celular o núcleo que acumula todas las señales ponderadas que están ingresando.</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                        <span className="font-bold text-sm text-green-700">Axón ➔ Salida (ŷ)</span>
                        <p className="text-xs text-gray-600 mt-1">El canal que dispara el pulso eléctrico si se supera el umbral (controlado por la Función de Activación).</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Panel Izquierdo: Visualizaciones */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">

                    {/* Visualización del Grafo */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                            <Network className="w-5 h-5 text-red-600" />
                            Estructura Interna
                        </h3>

                        {/* SVG Diagrama del Perceptrón */}
                        <div className="relative w-full max-w-lg h-80 bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
                                {/* Conexiones */}
                                <line x1="50" y1="80" x2="200" y2="150" stroke="#9ca3af" strokeWidth="2" />
                                <line x1="50" y1="220" x2="200" y2="150" stroke="#9ca3af" strokeWidth="2" />
                                <line x1="200" y1="150" x2="350" y2="150" stroke="#3b82f6" strokeWidth="3" />
                                <line x1="350" y1="150" x2="450" y2="150" stroke="#10b981" strokeWidth="3" />

                                {/* Inputs */}
                                <circle cx="50" cy="80" r="25" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2" />
                                <text x="50" y="85" textAnchor="middle" fontWeight="bold" fontSize="14">x₁={x1}</text>

                                <circle cx="50" cy="220" r="25" fill="#f3f4f6" stroke="#4b5563" strokeWidth="2" />
                                <text x="50" y="225" textAnchor="middle" fontWeight="bold" fontSize="14">x₂={x2}</text>

                                {/* Pesos (Etiquetas) */}
                                <rect x="100" y="90" width="50" height="24" rx="4" fill="white" stroke="#d1d5db" />
                                <text x="125" y="106" textAnchor="middle" fontSize="12" fill="#ef4444">w₁={w1}</text>

                                <rect x="100" y="180" width="50" height="24" rx="4" fill="white" stroke="#d1d5db" />
                                <text x="125" y="196" textAnchor="middle" fontSize="12" fill="#ef4444">w₂={w2}</text>

                                {/* Suma y Sesgo */}
                                <circle cx="200" cy="150" r="40" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
                                <text x="200" y="145" textAnchor="middle" fontSize="16" fontWeight="bold">Σ</text>
                                <text x="200" y="165" textAnchor="middle" fontSize="12" fill="#4b5563">z = {z.toFixed(2)}</text>

                                <rect x="180" y="200" width="40" height="24" rx="4" fill="white" stroke="#d1d5db" />
                                <text x="200" y="216" textAnchor="middle" fontSize="12" fill="#f59e0b">b={b}</text>
                                <line x1="200" y1="200" x2="200" y2="190" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4" />

                                {/* Activación */}
                                <rect x="300" y="110" width="50" height="80" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                                <text x="325" y="145" textAnchor="middle" fontSize="14" fontWeight="bold">f(z)</text>
                                <text x="325" y="165" textAnchor="middle" fontSize="10">{activation}</text>

                                {/* Output */}
                                <circle cx="450" cy="150" r="25" fill="#f3f4f6" stroke="#10b981" strokeWidth="2" />
                                <text x="450" y="155" textAnchor="middle" fontWeight="bold" fontSize="14">ŷ={y.toFixed(2)}</text>
                            </svg>
                        </div>
                    </div>

                    {/* Barrera de Decisión */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Barrera de Decisión (Espacio 2D)
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 text-center max-w-lg">
                            Observa cómo los pesos (<strong>w</strong>) inclinan la frontera y el sesgo (<strong>b</strong>) la desplaza.
                            El mapa de calor representa las áreas de activación y el punto verde es tu entrada actual.
                        </p>

                        <div className="relative w-full max-w-sm h-64 bg-slate-50 border border-gray-300 rounded-lg overflow-hidden shadow-inner">
                            <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                                {/* Grilla y ejes */}
                                <line x1="150" y1="0" x2="150" y2="300" stroke="#cbd5e1" strokeWidth="2" />
                                <line x1="0" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="2" />

                                {/* Puntos de calor */}
                                {decisionPoints.map((pt, i) => {
                                    const isRed = pt.ptY > 0.5;
                                    const intensity = activation === 'escalon' ? 0.6 : Math.abs(pt.ptY - 0.5) * 2;
                                    return (
                                        <circle
                                            key={i}
                                            cx={150 + pt.px * 30}
                                            cy={150 - pt.py * 30}
                                            r="6"
                                            fill={isRed ? '#ef4444' : '#3b82f6'}
                                            opacity={0.1 + intensity * 0.7}
                                        />
                                    )
                                })}

                                {/* Ejes etiquetas */}
                                <text x="280" y="140" fontSize="12" fill="#64748b" fontWeight="bold">x₁</text>
                                <text x="160" y="20" fontSize="12" fill="#64748b" fontWeight="bold">x₂</text>

                                {/* Línea de decisión matemática exacta */}
                                {w2 !== 0 ? (
                                    <line
                                        x1={150 - 5 * 30}
                                        y1={150 - ((-w1 * -5 - b) / w2) * 30}
                                        x2={150 + 5 * 30}
                                        y2={150 - ((-w1 * 5 - b) / w2) * 30}
                                        stroke="#1f2937"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                    />
                                ) : (
                                    <line
                                        x1={150 + (-b / w1) * 30}
                                        y1={0}
                                        x2={150 + (-b / w1) * 30}
                                        y2={300}
                                        stroke="#1f2937"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                    />
                                )}

                                {/* Punto de entrada actual */}
                                <circle
                                    cx={150 + x1 * 30}
                                    cy={150 - x2 * 30}
                                    r="7"
                                    fill="#10b981"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="shadow-lg"
                                />
                                <text x={150 + x1 * 30 + 10} y={150 - x2 * 30 + 5} fontSize="12" fontWeight="bold" fill="#047857">Actual</text>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Controles (Sticky) */}
                <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-gray-500" />
                        Panel de Control
                    </h3>

                    <div className="space-y-6">
                        {/* Entradas */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-sm text-gray-700 mb-3">Entradas (Datos)</h4>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm flex justify-between items-center">
                                    <span className="w-12">x₁: {x1}</span>
                                    <input type="range" min="-5" max="5" step="0.5" value={x1} onChange={(e) => setX1(Number(e.target.value))} className="w-full ml-2" />
                                </label>
                                <label className="text-sm flex justify-between items-center">
                                    <span className="w-12">x₂: {x2}</span>
                                    <input type="range" min="-5" max="5" step="0.5" value={x2} onChange={(e) => setX2(Number(e.target.value))} className="w-full ml-2" />
                                </label>
                            </div>
                        </div>

                        {/* Parámetros */}
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <h4 className="font-medium text-sm text-red-800 mb-3">Parámetros (Aprendizaje)</h4>
                            <div className="flex flex-col gap-3">
                                <label className="text-sm flex justify-between items-center text-red-900">
                                    <span className="w-12">w₁: {w1}</span>
                                    <input type="range" min="-5" max="5" step="0.1" value={w1} onChange={(e) => setW1(Number(e.target.value))} className="w-full ml-2 accent-red-600" />
                                </label>
                                <label className="text-sm flex justify-between items-center text-red-900">
                                    <span className="w-12">w₂: {w2}</span>
                                    <input type="range" min="-5" max="5" step="0.1" value={w2} onChange={(e) => setW2(Number(e.target.value))} className="w-full ml-2 accent-red-600" />
                                </label>
                                <label className="text-sm flex justify-between items-center text-yellow-700 mt-2 border-t border-red-200 pt-2">
                                    <span className="w-16">Sesgo b: {b}</span>
                                    <input type="range" min="-5" max="5" step="0.5" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full ml-2 accent-yellow-500" />
                                </label>
                            </div>
                        </div>

                        {/* Función de Activación */}
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-sm text-gray-700">Función de Activación</label>
                            <select
                                value={activation}
                                onChange={(e) => setActivation(e.target.value)}
                                className="p-2 border border-gray-300 rounded bg-white text-gray-700 w-full"
                            >
                                <option value="escalon">Escalón (Binario 0 o 1)</option>
                                <option value="sigmoide">Sigmoide (Probabilidad 0 a 1)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Funciones auxiliares para la pestaña de Entrenamiento
const calcLoss = (weight) => (14 / 3) * weight * weight - (56 / 3) * weight + (56 / 3);
const calcGrad = (weight) => (28 / 3) * weight - (56 / 3);

const Tab2GradientDescent = () => {
    const [alpha, setAlpha] = useState(0.05);
    const [w, setW] = useState(4.5);
    const [history, setHistory] = useState([{ epoch: 0, w: 4.5, loss: calcLoss(4.5) }]);
    const [isPlaying, setIsPlaying] = useState(false);

    const takeStep = () => {
        setW(currentW => {
            const gradient = calcGrad(currentW);
            const newW = currentW - (alpha * gradient);

            setHistory(prev => {
                const newHist = [...prev, { epoch: prev.length, w: newW, loss: calcLoss(newW) }];
                if (newHist.length > 30) newHist.shift();
                return newHist;
            });

            return newW;
        });
    };

    const handleManualW = (newW) => {
        setW(newW);
        setHistory([{ epoch: 0, w: newW, loss: calcLoss(newW) }]);
        setIsPlaying(false);
    };

    const reset = () => {
        handleManualW(4.5);
    };

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                takeStep();
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, alpha]);

    const getLossSvgX = (weight) => 30 + ((weight + 1) / 6) * 240;
    const getLossSvgY = (loss) => 180 - (loss / 45) * 150;
    const generateLossPath = () => {
        let path = "";
        for (let currentW = -1; currentW <= 5; currentW += 0.1) {
            const px = getLossSvgX(currentW);
            const py = getLossSvgY(calcLoss(currentW));
            if (currentW === -1) path += `M ${px} ${py} `;
            else path += `L ${px} ${py} `;
        }
        return path;
    };

    const getModelSvgX = (x) => 30 + (x / 4) * 240;
    const getModelSvgY = (y) => 180 - (y / 20) * 150;
    const dataPoints = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-3">El Paradigma del Entrenamiento</h2>
                    <p className="text-gray-600">
                        A diferencia de la programación tradicional donde escribimos reglas fijas, las redes neuronales <strong>aprenden de los datos</strong>.
                        Iniciamos con parámetros aleatorios (lo que da predicciones erróneas) y, mediante ejemplos reales, <strong>ajustamos esos pesos iterativamente</strong> para que el modelo encaje en los datos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg border border-gray-200 mt-2">
                    <div>
                        <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5" /> Función de Pérdida (Loss)
                        </h3>
                        <p className="text-sm text-gray-700">
                            Es una métrica que calcula <strong>qué tan equivocadas</strong> son nuestras predicciones actuales frente a la realidad. En problemas continuos, usamos típicamente el Error Cuadrático Medio (MSE). ¡El objetivo del entrenamiento es minimizar esta función matemática!
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5" /> Descenso del Gradiente
                        </h3>
                        <p className="text-sm text-gray-700">
                            Es el algoritmo motor de este proceso. Calcula la derivada (pendiente) del error con respecto al peso. Si la pendiente es positiva, debemos reducir el peso; si es negativa, aumentarlo. La Tasa de Aprendizaje (α) define el tamaño del paso.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center mt-2">
                    <MathEquation>
                        <span className="font-bold">Regla de Actualización:</span> &nbsp;
                        <span className="text-red-700">w<sub>nuevo</sub></span> =
                        <span> w<sub>actual</sub></span> -
                        <span className="text-blue-600 font-bold"> α </span>
                        <span>( <span className="text-sm">∂L</span> / <span className="text-sm">∂w</span> )</span>
                    </MathEquation>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col relative group">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Modelo vs Datos (ŷ = w·x)</h3>
                    <p className="text-sm text-blue-600 font-semibold text-center mb-4 bg-blue-50 py-1 rounded">Objetivo: Enseñar a multiplicar por 2</p>

                    <div className="relative w-full h-48 bg-slate-50 border border-slate-200 rounded overflow-hidden">
                        <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                            <line x1="30" y1="180" x2="280" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                            <line x1="30" y1="20" x2="30" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                            <text x="285" y="185" fontSize="10" fill="#64748b">x</text>
                            <text x="15" y="15" fontSize="10" fill="#64748b">y</text>

                            <line
                                x1={getModelSvgX(0)} y1={getModelSvgY(0)}
                                x2={getModelSvgX(4)} y2={getModelSvgY(4 * w)}
                                stroke={theme.primary} strokeWidth="3"
                                className="transition-all duration-300"
                            />

                            {dataPoints.map((pt, i) => (
                                <g key={`data-${i}`}>
                                    <line
                                        x1={getModelSvgX(pt.x)} y1={getModelSvgY(pt.y)}
                                        x2={getModelSvgX(pt.x)} y2={getModelSvgY(pt.x * w)}
                                        stroke="#fca5a5" strokeWidth="2" strokeDasharray="3"
                                        className="transition-all duration-300"
                                    />
                                    <circle
                                        cx={getModelSvgX(pt.x)} cy={getModelSvgY(pt.y)}
                                        r="5" fill="#10b981" stroke="white" strokeWidth="1"
                                        className="z-10 relative"
                                    />
                                </g>
                            ))}
                        </svg>
                        <div className="absolute top-2 right-2 bg-white/90 p-2 text-[10px] rounded border border-red-200 opacity-0 group-hover:opacity-100 transition shadow">
                            Líneas punteadas rojas = Errores
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <label className="text-sm font-semibold flex justify-between">
                            <span>Ajuste manual del peso (w): {w.toFixed(2)}</span>
                        </label>
                        <input
                            type="range" min="-1" max="5" step="0.1"
                            value={w}
                            onChange={(e) => handleManualW(Number(e.target.value))}
                            className="w-full accent-red-600 mt-2 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Superficie de Pérdida</h3>
                    <p className="text-xs text-gray-500 text-center mb-4">El objetivo es llegar al valle (Mínimo)</p>
                    <div className="relative w-full h-48 bg-slate-50 border border-slate-200 rounded overflow-hidden">
                        <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                            <line x1="30" y1="180" x2="280" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                            <line x1="30" y1="20" x2="30" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                            <text x="285" y="185" fontSize="10" fill="#64748b">w</text>
                            <text x="10" y="15" fontSize="10" fill="#64748b">Loss</text>

                            <path d={generateLossPath()} fill="none" stroke="#94a3b8" strokeWidth="3" />

                            {history.map((pt, i) => {
                                if (i === 0) return null;
                                const prev = history[i - 1];
                                const x1 = getLossSvgX(prev.w);
                                const y1 = getLossSvgY(prev.loss);
                                const x2 = getLossSvgX(pt.w);
                                const y2 = getLossSvgY(pt.loss);
                                return (
                                    <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fca5a5" strokeWidth="2" />
                                );
                            })}

                            <line
                                x1={getLossSvgX(w - 0.5)} y1={getLossSvgY(calcLoss(w) - 0.5 * calcGrad(w))}
                                x2={getLossSvgX(w + 0.5)} y2={getLossSvgY(calcLoss(w) + 0.5 * calcGrad(w))}
                                stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"
                                className="transition-all duration-300"
                            />

                            <circle
                                cx={getLossSvgX(w)} cy={getLossSvgY(calcLoss(w))}
                                r="6" fill={theme.primary}
                                className="transition-all duration-300 shadow-md"
                            />
                        </svg>
                    </div>
                    <div className="mt-4 flex flex-col items-center justify-center bg-gray-50 py-2 rounded">
                        <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            MSE Actual: {calcLoss(w).toFixed(2)}
                        </span>
                        <span className="text-xs text-blue-600 font-medium">
                            Pendiente (Derivada): {calcGrad(w).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Control del Descenso</h3>

                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-gray-800 text-sm">
                                Tasa de Aprendizaje (α): {alpha.toFixed(2)}
                            </label>
                        </div>
                        <input
                            type="range" min="0.01" max="0.25" step="0.01"
                            value={alpha} onChange={(e) => setAlpha(Number(e.target.value))}
                            className="w-full accent-blue-600 mb-2 cursor-pointer"
                        />
                        <p className="text-[11px] text-blue-800 text-center font-medium">
                            {alpha < 0.05 ? "Seguro pero muy lento" : alpha > 0.20 ? "¡Paso grande! Peligro de divergencia" : "Velocidad óptima"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            onClick={takeStep} disabled={isPlaying}
                            className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition disabled:opacity-50 flex justify-center items-center gap-2 text-sm shadow"
                        >
                            <ArrowRight className="w-4 h-4" /> Ejecutar 1 Paso (Gradiente)
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex-1 py-2 px-4 rounded transition flex justify-center items-center gap-2 text-sm font-semibold border ${isPlaying ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}
                            >
                                <Play className="w-4 h-4" /> {isPlaying ? "Pausar" : "Animar"}
                            </button>
                            <button
                                onClick={reset} className="px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition" title="Reiniciar Posición"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">Histórico: Error vs Interaciones</h4>
                        <div className="relative w-full h-16 bg-slate-50 rounded border border-slate-200 overflow-hidden pt-1">
                            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                                <polyline
                                    points={history.map((h, i) => `${(i / Math.max(20, history.length)) * 300},${100 - (h.loss / 45) * 100}`).join(' ')}
                                    fill="none" stroke={theme.primary} strokeWidth="2" strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tab3ForwardPass = () => {
    const [archInput, setArchInput] = useState("2, 4, 4, 1");
    const [selectedNeuron, setSelectedNeuron] = useState(null);

    const calculateParams = () => {
        try {
            const layers = archInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
            if (layers.length < 2) return { details: [], totalW: 0, totalB: 0, total: 0 };

            let details = [];
            let totalW = 0;
            let totalB = 0;

            for (let i = 0; i < layers.length - 1; i++) {
                const w = layers[i] * layers[i + 1];
                const b = layers[i + 1];
                details.push({
                    from: layers[i],
                    to: layers[i + 1],
                    w,
                    b,
                    layerIdx: i + 1
                });
                totalW += w;
                totalB += b;
            }
            return { details, totalW, totalB, total: totalW + totalB, layers };
        } catch {
            return { details: [], totalW: 0, totalB: 0, total: 0 };
        }
    };

    const params = calculateParams();

    return (
        <div className="flex flex-col gap-8 animate-fade-in">

            {/* Sección 1: Teoría y El Problema XOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-red-600" />
                        De la Neurona a la Red
                    </h2>
                    <p className="text-gray-600 text-justify mb-4">
                        Una <strong>Red Neuronal (MLP)</strong> no es más que un conjunto de perceptrones (neuronas) organizados en capas.
                        La clave de su poder es la conectividad: <strong>la salida (activación) de una neurona se convierte en la entrada de las neuronas de la siguiente capa</strong>.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> ¿Por qué necesitamos juntarlas?
                        </h4>
                        <p className="text-sm text-gray-700">
                            Un solo perceptrón forma una línea recta (separador lineal). Problemas del mundo real, o incluso problemas de lógica básica como la compuerta <strong>XOR (O Exclusivo)</strong>, no pueden resolverse trazando una sola línea.
                        </p>
                    </div>
                </div>

                {/* Gráfico XOR */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">El Problema XOR</h3>
                    <p className="text-xs text-gray-500 mb-4 text-center">Intenta trazar una sola línea recta que separe las X de los O. ¡Es imposible!</p>
                    <div className="relative w-full max-w-[250px] h-[250px] bg-slate-50 border border-slate-200 rounded-lg">
                        <svg viewBox="0 0 100 100" width="100%" height="100%" className="overflow-visible p-4" preserveAspectRatio="xMidYMid meet">
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#cbd5e1" strokeWidth="2" />
                            <line x1="10" y1="10" x2="10" y2="90" stroke="#cbd5e1" strokeWidth="2" />

                            <circle cx="20" cy="80" r="4" fill="none" stroke="#ef4444" strokeWidth="2" />
                            <circle cx="80" cy="20" r="4" fill="none" stroke="#ef4444" strokeWidth="2" />

                            <path d="M 17 17 L 23 23 M 23 17 L 17 23" stroke="#3b82f6" strokeWidth="2" />
                            <path d="M 77 77 L 83 83 M 83 77 L 77 83" stroke="#3b82f6" strokeWidth="2" />

                            <text x="5" y="95" fontSize="6" fill="#64748b">0,0</text>
                            <text x="85" y="95" fontSize="6" fill="#64748b">1,0</text>
                            <text x="5" y="15" fontSize="6" fill="#64748b">0,1</text>
                            <text x="85" y="15" fontSize="6" fill="#64748b">1,1</text>

                            <line x1="15" y1="50" x2="85" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Anatomía de la Red */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                    <Network className="w-6 h-6 text-blue-600" />
                    Anatomía de una Red Multicapa (MLP)
                </h3>
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <p className="text-sm text-gray-700 text-justify mb-2">
                            Una arquitectura de red neuronal clásica (conocida como Perceptrón Multicapa o Red Densa) se organiza estrictamente en un flujo de información que atraviesa tres tipos de capas:
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="font-bold text-green-800 text-sm flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#dcfce7] border-2 border-[#16a34a]"></span> Capa de Entrada (Input Layer)
                                </h4>
                                <p className="text-xs text-green-900 mt-1">No hace cálculos matemáticos. Simplemente recibe las variables o características (<em>features</em>) iniciales de los datos y las transmite al resto de la red. Su tamaño equivale a la cantidad de variables de tu problema.</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#eff6ff] border-2 border-[#2563eb]"></span> Capas Ocultas (Hidden Layers)
                                </h4>
                                <p className="text-xs text-blue-900 mt-1">Aquí ocurre la "magia". Son las encargadas de extraer patrones matemáticos cada vez más complejos. Se llaman "ocultas" porque no tienen contacto directo ni con los datos originales de entrada ni con la predicción final (ŷ).</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <h4 className="font-bold text-orange-800 text-sm flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#ffedd5] border-2 border-[#ea580c]"></span> Capa de Salida (Output Layer)
                                </h4>
                                <p className="text-xs text-orange-900 mt-1">Sintetiza todo el procesamiento previo para entregar la predicción final de la red (ŷ) (por ejemplo, un único número continuo para predecir un precio, o varias probabilidades para clasificar categorías).</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 h-72 bg-slate-50 rounded-xl border border-slate-200 relative flex flex-col p-4 overflow-hidden">
                        <div className="absolute top-4 w-full left-0 flex justify-between px-8 text-xs font-bold text-gray-500 text-center z-10">
                            <span className="w-[15%] text-green-700">Entrada</span>
                            <span className="w-[70%] text-blue-700">Capas Ocultas</span>
                            <span className="w-[15%] text-orange-700">Salida</span>
                        </div>

                        <div className="flex-grow w-full relative mt-6 flex items-center justify-center">
                            <NeuralNetworkSVG layers={[2, 4, 4, 2]} colorMode="architecture" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección 2: Arquitectura y Pesos */}
            <div className="flex flex-col gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        La Complejidad Oculta: Calculando Parámetros
                    </h3>
                    <p className="text-gray-600">
                        Una de las mayores complejidades computacionales de las redes neuronales radica en la explosión de parámetros que deben ajustarse durante el entrenamiento.
                        Para conectar una capa con la siguiente, <strong>cada neurona de origen se conecta con todas las neuronas de destino</strong> (esto genera los Pesos o <em>Weights</em>),
                        y cada neurona de destino tiene su propia tendencia intrínseca (el Sesgo o <em>Bias</em>).
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-50 p-4 rounded-lg border border-blue-100 justify-center">
                        <span className="text-sm font-semibold text-blue-800">Fórmula por capa:</span>
                        <MathEquation>
                            P = (N<sub>anterior</sub> × N<sub>actual</sub>) + N<sub>actual</sub>
                        </MathEquation>
                        <div className="text-xs text-gray-600 flex flex-col gap-1 md:border-l md:border-blue-200 md:pl-6">
                            <span><strong>N<sub>anterior</sub></strong>: Neuronas en la capa previa</span>
                            <span><strong>N<sub>actual</sub></strong>: Neuronas en la capa receptora</span>
                            <span><strong>P</strong>: Total de parámetros (Pesos + Sesgos)</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Simulador de Arquitectura</h3>
                        <p className="text-sm text-gray-600 mb-4 text-justify">
                            Pon a prueba la fórmula anterior. Modifica la arquitectura (neuronas por capa, separadas por comas) para ver cómo crece el tamaño de la red exponencialmente.
                        </p>

                        <div className="flex gap-4 items-center mb-6">
                            <label className="font-semibold text-gray-700 text-sm whitespace-nowrap">Arquitectura:</label>
                            <input
                                type="text"
                                value={archInput}
                                onChange={(e) => setArchInput(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                                placeholder="Ej: 2, 8, 8, 1"
                            />
                        </div>
                        {params.details.map((d, i) => (
                            <div key={i} className="grid grid-cols-4 gap-2 text-sm text-gray-700 py-1 text-center border-b border-gray-100 last:border-0">
                                <span className="font-mono text-xs">Capa {i} ➔ {i + 1}</span>
                                <span>{d.from} × {d.to} = {d.w}</span>
                                <span>{d.to}</span>
                                <span className="font-semibold">{d.w + d.b}</span>
                            </div>
                        ))}
                        <div className="mt-4 pt-3 border-t-2 border-slate-300 flex justify-between items-center px-2">
                            <span className="font-bold text-gray-800">Total de Parámetros:</span>
                            <span className="text-xl font-bold text-red-600 bg-red-50 px-3 py-1 rounded">{params.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1f2937] text-white p-6 rounded-xl shadow-lg border border-gray-800 flex flex-col justify-center relative overflow-hidden">
                    <Brain className="absolute -right-10 -bottom-10 w-48 h-48 text-gray-700 opacity-20" />
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                        <Info className="w-5 h-5" /> Datos Curiosos (Modelos LLM)
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 text-justify">
                        Cuando escuchas sobre modelos de Inteligencia Artificial gigantes, "el número de parámetros" se refiere exactamente a esto: <strong>la suma de todos los pesos y sesgos</strong> en sus inmensas capas ocultas.
                    </p>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Tu red actual:</span>
                            <span className="font-mono font-bold text-green-400">{params.total.toLocaleString()} params</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Red clásica de imágenes (ResNet-50):</span>
                            <span className="font-mono font-bold text-blue-300">~25.6 Millones</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Llama 3 (Pequeño):</span>
                            <span className="font-mono font-bold text-purple-300">8,000 Millones (8B)</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-400">GPT-3 (2020):</span>
                            <span className="font-mono font-bold text-yellow-300">175,000 Millones (175B)</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Sección 3: Paso Forward Interactivo (Micro Red) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-green-600" />
                    Simulación Detallada: El Paso Forward (Propagación hacia adelante)
                </h3>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-sm text-gray-700 mb-6 shadow-sm">
                    <p className="mb-2">
                        El <strong>Paso Forward</strong> es el proceso mediante el cual los datos de entrada fluyen a través de la red neuronal, capa por capa, hasta producir una predicción final (ŷ). En cada neurona que recibe datos, ocurren dos operaciones fundamentales en este orden:
                    </p>
                    <ul className="list-disc ml-6 text-gray-600 space-y-1">
                        <li><strong>Suma Ponderada:</strong> Se multiplican todas las entradas recibidas por sus respectivos pesos y se le suma el sesgo.</li>
                        <li><strong>Activación:</strong> El resultado numérico de la suma pasa por una función no lineal para generar la señal de salida (a) que se enviará a la siguiente capa.</li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex flex-col items-center shadow-inner">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm">Fórmula General de una Neurona</h4>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <MathEquation>
                            z = <span className="text-lg">∑</span> (<span className="text-blue-600">w<sub>i</sub></span> · x<sub>i</sub>) + <span className="text-yellow-600">b</span>
                        </MathEquation>
                        <span className="text-gray-400 font-bold">➔</span>
                        <MathEquation>
                            a = f(z)
                        </MathEquation>
                    </div>
                    <div className="text-xs text-gray-600 mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
                        <span><strong>x<sub>i</sub></strong>: Entradas previas</span>
                        <span><strong className="text-blue-700">w<sub>i</sub></strong>: Pesos (Conexiones)</span>
                        <span><strong className="text-yellow-700">b</strong>: Sesgo (Bias)</span>
                        <span><strong>f()</strong>: Función de Activación</span>
                        <span><strong>a</strong>: Activación / Salida hacia la siguiente capa</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 font-medium">
                    Haz clic en las neuronas de las capas ocultas (h₁, h₂) o de salida para ver matemáticamente cómo las entradas se transforman y avanzan.
                </p>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 h-64 bg-slate-50 border border-slate-200 rounded-lg relative flex items-center justify-center p-4">
                        <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                            <line x1="50" y1="50" x2="200" y2="50" stroke={selectedNeuron === 'h1' ? theme.accent : "#94a3b8"} strokeWidth={selectedNeuron === 'h1' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="125" y="45" fontSize={selectedNeuron === 'h1' ? "12" : "10"} fontWeight={selectedNeuron === 'h1' ? "bold" : "normal"} fill={selectedNeuron === 'h1' ? theme.accent : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=0.5</text>

                            <line x1="50" y1="50" x2="200" y2="150" stroke={selectedNeuron === 'h2' ? theme.accent : "#94a3b8"} strokeWidth={selectedNeuron === 'h2' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="125" y="115" fontSize={selectedNeuron === 'h2' ? "12" : "10"} fontWeight={selectedNeuron === 'h2' ? "bold" : "normal"} fill={selectedNeuron === 'h2' ? theme.accent : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=-0.5</text>

                            <line x1="50" y1="150" x2="200" y2="50" stroke={selectedNeuron === 'h1' ? theme.accent : "#94a3b8"} strokeWidth={selectedNeuron === 'h1' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="125" y="95" fontSize={selectedNeuron === 'h1' ? "12" : "10"} fontWeight={selectedNeuron === 'h1' ? "bold" : "normal"} fill={selectedNeuron === 'h1' ? theme.accent : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=-0.5</text>

                            <line x1="50" y1="150" x2="200" y2="150" stroke={selectedNeuron === 'h2' ? theme.accent : "#94a3b8"} strokeWidth={selectedNeuron === 'h2' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="125" y="145" fontSize={selectedNeuron === 'h2' ? "12" : "10"} fontWeight={selectedNeuron === 'h2' ? "bold" : "normal"} fill={selectedNeuron === 'h2' ? theme.accent : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=1.0</text>

                            <line x1="200" y1="50" x2="350" y2="100" stroke={selectedNeuron === 'o1' ? '#10b981' : "#94a3b8"} strokeWidth={selectedNeuron === 'o1' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="275" y="70" fontSize={selectedNeuron === 'o1' ? "12" : "10"} fontWeight={selectedNeuron === 'o1' ? "bold" : "normal"} fill={selectedNeuron === 'o1' ? '#10b981' : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=1.0</text>

                            <line x1="200" y1="150" x2="350" y2="100" stroke={selectedNeuron === 'o1' ? '#10b981' : "#94a3b8"} strokeWidth={selectedNeuron === 'o1' ? "3" : "2"} className="transition-all duration-300" />
                            <text x="275" y="140" fontSize={selectedNeuron === 'o1' ? "12" : "10"} fontWeight={selectedNeuron === 'o1' ? "bold" : "normal"} fill={selectedNeuron === 'o1' ? '#10b981' : "#64748b"} textAnchor="middle" className="transition-all duration-300">w=1.0</text>

                            <circle cx="50" cy="50" r="16" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
                            <text x="50" y="54" fontSize="12" fontWeight="bold" textAnchor="middle">2</text>
                            <text x="50" y="25" fontSize="10" fill="#64748b" textAnchor="middle">Entrada 1</text>

                            <circle cx="50" cy="150" r="16" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
                            <text x="50" y="154" fontSize="12" fontWeight="bold" textAnchor="middle">1</text>
                            <text x="50" y="185" fontSize="10" fill="#64748b" textAnchor="middle">Entrada 2</text>

                            <g className="cursor-pointer" onClick={() => setSelectedNeuron('h1')}>
                                <circle cx="200" cy="50" r="20" fill={selectedNeuron === 'h1' ? '#eff6ff' : 'white'} stroke={selectedNeuron === 'h1' ? theme.accent : '#3b82f6'} strokeWidth={selectedNeuron === 'h1' ? '4' : '2'} className="transition-all hover:stroke-blue-500 hover:stroke-[3px]" />
                                <text x="200" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#1d4ed8">h₁</text>
                                <rect x="185" y="10" width="30" height="15" fill="#fef3c7" rx="2" />
                                <text x="200" y="21" fontSize="9" textAnchor="middle">b=0</text>
                            </g>

                            <g className="cursor-pointer" onClick={() => setSelectedNeuron('h2')}>
                                <circle cx="200" cy="150" r="20" fill={selectedNeuron === 'h2' ? '#eff6ff' : 'white'} stroke={selectedNeuron === 'h2' ? theme.accent : '#3b82f6'} strokeWidth={selectedNeuron === 'h2' ? '4' : '2'} className="transition-all hover:stroke-blue-500 hover:stroke-[3px]" />
                                <text x="200" y="154" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#1d4ed8">h₂</text>
                                <rect x="185" y="175" width="30" height="15" fill="#fef3c7" rx="2" />
                                <text x="200" y="186" fontSize="9" textAnchor="middle">b=0.5</text>
                            </g>

                            <g className="cursor-pointer" onClick={() => setSelectedNeuron('o1')}>
                                <circle cx="350" cy="100" r="20" fill={selectedNeuron === 'o1' ? '#ecfdf5' : 'white'} stroke={selectedNeuron === 'o1' ? '#10b981' : '#10b981'} strokeWidth={selectedNeuron === 'o1' ? '4' : '2'} className="transition-all hover:stroke-green-500 hover:stroke-[3px]" />
                                <text x="350" y="104" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#047857">Salida</text>
                                <rect x="335" y="60" width="30" height="15" fill="#fef3c7" rx="2" />
                                <text x="350" y="71" fontSize="9" textAnchor="middle">b=-0.2</text>
                            </g>
                        </svg>
                    </div>

                    <div className="w-full md:w-1/2 bg-[#f8fafc] border border-blue-100 rounded-lg p-5 flex flex-col justify-center min-h-[16rem]">
                        {!selectedNeuron ? (
                            <div className="text-center text-gray-400 flex flex-col items-center">
                                <Info className="w-8 h-8 mb-2 opacity-50" />
                                <p>Selecciona la neurona <strong>h₁</strong>, <strong>h₂</strong> o <strong>Salida</strong> en el diagrama para inspeccionar su cálculo interno.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col gap-3">
                                <h4 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-2">
                                    {selectedNeuron === 'h1' && "Inspeccionando Neurona h₁"}
                                    {selectedNeuron === 'h2' && "Inspeccionando Neurona h₂"}
                                    {selectedNeuron === 'o1' && "Inspeccionando Neurona de Salida"}
                                </h4>

                                {selectedNeuron === 'h1' && (
                                    <>
                                        <p className="text-sm text-gray-700"><strong>1. Suma Ponderada (z):</strong> Recibe las entradas multiplicadas por sus pesos.</p>
                                        <MathEquation>
                                            z = (2 × 0.5) + (1 × -0.5) + <span className="text-yellow-600">0</span> = <span className="font-bold">0.5</span>
                                        </MathEquation>
                                        <p className="text-sm text-gray-700 mt-2"><strong>2. Activación (ReLU):</strong> max(0, z)</p>
                                        <MathEquation>
                                            a = max(0, 0.5) = <span className="text-blue-600 font-bold">0.5</span>
                                        </MathEquation>
                                        <p className="text-xs text-gray-500 mt-2 italic">Este valor (0.5) es el que viaja hacia la siguiente capa.</p>
                                    </>
                                )}

                                {selectedNeuron === 'h2' && (
                                    <>
                                        <p className="text-sm text-gray-700"><strong>1. Suma Ponderada (z):</strong></p>
                                        <MathEquation>
                                            z = (2 × -0.5) + (1 × 1.0) + <span className="text-yellow-600">0.5</span> = <span className="font-bold">0.5</span>
                                        </MathEquation>
                                        <p className="text-sm text-gray-700 mt-2"><strong>2. Activación (ReLU):</strong></p>
                                        <MathEquation>
                                            a = max(0, 0.5) = <span className="text-blue-600 font-bold">0.5</span>
                                        </MathEquation>
                                    </>
                                )}

                                {selectedNeuron === 'o1' && (
                                    <>
                                        <p className="text-sm text-gray-700"><strong>1. Suma Ponderada (z):</strong> Recibe las <strong>activaciones (a)</strong> de h₁ y h₂.</p>
                                        <MathEquation>
                                            z = (0.5 × 1.0) + (0.5 × 1.0) <span className="text-yellow-600">- 0.2</span> = <span className="font-bold">0.8</span>
                                        </MathEquation>
                                        <p className="text-sm text-gray-700 mt-2"><strong>2. Predicción Final (Identidad):</strong> Al ser la última capa de un modelo de regresión, su salida es la predicción final (ŷ).</p>
                                        <MathEquation>
                                            ŷ = <span className="text-green-600 font-bold text-xl">0.8</span>
                                        </MathEquation>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const Tab4Backpropagation = () => {
    const [hoveredLayer, setHoveredLayer] = useState(null);
    const [isBackpropping, setIsBackpropping] = useState(false);
    const [activeLayerBP, setActiveLayerBP] = useState(-1);

    const startBackprop = () => {
        if (isBackpropping) return;
        setIsBackpropping(true);
        setActiveLayerBP(3); // Start at output

        const stages = [2, 1, 0, -1];
        stages.forEach((stage, index) => {
            setTimeout(() => {
                setActiveLayerBP(stage);
                if (stage === -1) {
                    setIsBackpropping(false);
                }
            }, (index + 1) * 1200);
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">

            {/* Sección Teórica: El Problema y La Solución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6" /> El Reto de la Caja Negra
                    </h3>
                    <p className="text-sm text-red-900 text-justify">
                        En un Perceptrón Simple era fácil ajustar los pesos: si la salida era incorrecta, sabíamos exactamente a quién culpar.
                        Pero en una <strong>Red Multicapa (MLP)</strong>, solo podemos medir el error al final (en la Capa de Salida comparando ŷ con y).
                    </p>
                    <p className="text-sm text-red-900 font-medium bg-red-100/50 p-3 rounded border border-red-200">
                        Si la predicción falla, ¿qué peso específico causó el problema? ¿Fue una conexión defectuosa en la primera capa oculta o en la última? Como las capas intermedias están "ocultas", no sabemos qué error cometió cada neurona individual.
                    </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                        <GitMerge className="w-6 h-6" /> Backpropagation (La Solución)
                    </h3>
                    <p className="text-sm text-blue-900 text-justify">
                        La Propagación hacia Atrás (Backpropagation) es el algoritmo revolucionario que resolvió este problema. Utiliza una técnica de cálculo diferencial llamada <strong>Regla de la Cadena</strong>.
                    </p>
                    <p className="text-sm text-blue-900 text-justify">
                        En lugar de adivinar, toma el <strong>Error Final (Loss)</strong> y lo hace viajar en reversa. Como un gerente rastreando un fallo en una línea de ensamblaje, el algoritmo reparte la culpa "hacia atrás", ajustando cada peso proporcionalmente según cuánto contribuyó al error final.
                    </p>
                </div>
            </div>

            {/* Enlaces de YouTube Recomendados */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Youtube className="w-8 h-8 text-red-600" />
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">¿Quieres profundizar sin volverte loco con la matemática?</h4>
                        <p className="text-xs text-gray-500">Te recomendamos estos dos videos excelentes (Tienen subtítulos y animaciones top):</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a href="https://youtu.be/Ilg3gGewQ5U" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2 px-4 rounded border border-gray-300 transition whitespace-nowrap">
                        3Blue1Brown (Intuición)
                    </a>
                    <a href="https://youtu.be/eNIqz_noix8" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2 px-4 rounded border border-gray-300 transition whitespace-nowrap">
                        DotCSV (Explicación)
                    </a>
                </div>
            </div>

            <div className="flex justify-center">
                {/* Diagrama de Red (Interactivo Enriquecido) */}
                <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Animación del Algoritmo</h3>
                        <button
                            onClick={startBackprop}
                            disabled={isBackpropping}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                            <RotateCcw className="w-4 h-4" /> Ejecutar Backprop
                        </button>
                    </div>

                    <div className="w-full h-80 bg-gray-50 rounded-xl border border-gray-200 relative flex flex-col overflow-hidden">
                        <div className="flex-grow relative w-full h-full pt-4">
                            <NeuralNetworkSVG
                                layers={[2, 4, 4, 1]}
                                isBackward={isBackpropping}
                                activeLayer={activeLayerBP}
                                onNodeHover={setHoveredLayer}
                                hoveredLayer={hoveredLayer}
                                colorMode="colored"
                            />

                            {/* Etiquetas Backprop flotantes enriquecidas */}
                            {isBackpropping && (
                                <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10">
                                    {activeLayerBP === 3 && (
                                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-red-800 animate-pulse flex flex-col items-center">
                                            <strong>1. Evaluando el Daño</strong>
                                            <span className="text-xs opacity-90">Calculando Error (Loss): (Predicción ŷ - Real y)²</span>
                                        </span>
                                    )}
                                    {activeLayerBP === 2 && (
                                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-red-700 animate-pulse flex flex-col items-center">
                                            <strong>2. Repartiendo Culpa (Regla de Cadena)</strong>
                                            <span className="text-xs opacity-90">Calculando gradiente y ajustando pesos de la Capa Oculta 2</span>
                                        </span>
                                    )}
                                    {activeLayerBP === 1 && (
                                        <span className="bg-red-400 text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-red-600 animate-pulse flex flex-col items-center">
                                            <strong>3. Propagando hacia el inicio</strong>
                                            <span className="text-xs opacity-90">Calculando gradiente y ajustando pesos de la Capa Oculta 1</span>
                                        </span>
                                    )}
                                    {activeLayerBP === 0 && (
                                        <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-green-800 animate-pulse flex flex-col items-center">
                                            <strong>4. ¡Ciclo Completado!</strong>
                                            <span className="text-xs opacity-90">Todos los parámetros (W y b) fueron actualizados</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Leyenda de Colores */}
                        <div className="flex justify-center gap-6 py-3 border-t border-gray-200 bg-white/50 rounded-b-xl text-xs font-medium text-gray-600 z-10">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#dcfce7] border-2 border-[#16a34a]"></span> Entrada
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#eff6ff] border-2 border-[#2563eb]"></span> Oculta
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ffedd5] border-2 border-[#ea580c]"></span> Salida
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tab5ActivationFunctions = () => {
    const ActivationCard = ({ title, formula, desc, type }) => {
        let yMin, yMax;
        if (type === 'escalon') { yMin = -0.5; yMax = 1.5; }
        else if (type === 'sigmoide') { yMin = -0.2; yMax = 1.2; }
        else if (type === 'tanh') { yMin = -1.5; yMax = 1.5; }
        else if (type === 'relu') { yMin = -1; yMax = 5; }
        else if (type === 'lineal') { yMin = -5; yMax = 5; }
        else if (type === 'softmax') { yMin = 0; yMax = 1; }

        const getSvgY = (val) => 150 - ((val - yMin) / (yMax - yMin)) * 150;
        const getSvgX = (val) => ((val + 5) / 10) * 200;

        let path = "";
        if (type !== 'softmax') {
            for (let x = -5; x <= 5; x += 0.1) {
                let y = 0;
                if (type === 'escalon') y = x >= 0 ? 1 : 0;
                if (type === 'sigmoide') y = 1 / (1 + Math.exp(-x));
                if (type === 'tanh') y = Math.tanh(x);
                if (type === 'relu') y = Math.max(0, x);
                if (type === 'lineal') y = x;

                const px = getSvgX(x);
                const py = getSvgY(y);
                if (x === -5) path += `M ${px} ${py} `;
                else path += `L ${px} ${py} `;
            }
        }

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition">
                <h4 className="text-xl font-bold text-gray-800">{title}</h4>
                <div className="flex justify-center bg-gray-50 py-3 rounded border border-gray-100">
                    <MathEquation>{formula}</MathEquation>
                </div>
                <p className="text-sm text-gray-600 h-24 overflow-y-auto pr-2 text-justify">{desc}</p>
                <div className="w-full flex justify-center mt-auto pt-4 border-t border-gray-100">
                    {type === 'softmax' ? (
                        <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className="w-full max-w-[250px] bg-slate-50 border border-slate-200 rounded">
                            <rect x="40" y="80" width="25" height="70" fill="#cbd5e1" />
                            <rect x="85" y="30" width="25" height="120" fill="#cbd5e1" />
                            <rect x="130" y="100" width="25" height="50" fill="#cbd5e1" />

                            <path d="M 52 70 Q 97 -20 142 90" fill="none" stroke="#c8102e" strokeWidth="3" strokeDasharray="4" />

                            <text x="52" y="65" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">0.2</text>
                            <text x="97" y="20" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">0.7</text>
                            <text x="142" y="85" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">0.1</text>

                            <text x="97" y="140" textAnchor="middle" fontSize="11" fill="#1f2937" fontWeight="bold">Σ = 1.0 (Distribución)</text>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className="w-full max-w-[250px] bg-slate-50 border border-slate-200 rounded">
                            <line x1="0" y1={getSvgY(0)} x2="200" y2={getSvgY(0)} stroke="#cbd5e1" strokeWidth="2" />
                            <line x1={getSvgX(0)} y1="0" x2={getSvgX(0)} y2="150" stroke="#cbd5e1" strokeWidth="2" />
                            <path d={path} fill="none" stroke="#c8102e" strokeWidth="3" />
                            <text x="185" y={getSvgY(0) - 5} fontSize="12" fill="#94a3b8">x</text>
                            <text x={getSvgX(0) + 5} y="15" fontSize="12" fill="#94a3b8">f(z)</text>
                        </svg>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in flex flex-col gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm text-gray-700 flex flex-col md:flex-row gap-4 items-center">
                <TrendingUp className="w-12 h-12 text-blue-500 shrink-0" />
                <div>
                    <h3 className="font-bold text-lg mb-1">¿Por qué necesitamos Funciones de Activación?</h3>
                    <p className="text-sm">
                        Sin ellas, no importa cuántas capas tenga la red neuronal, las operaciones matemáticas colapsarían
                        y todo equivaldría a un solo Perceptrón lineal simple. Las funciones de activación introducen
                        la <strong>"no linealidad"</strong> que permite a las redes aprender y mapear patrones complejos (como curvas o polígonos).
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActivationCard
                    title="Escalón (Step)"
                    formula={<span>f(z) = z ≥ 0 ? 1 : 0</span>}
                    desc="La función original del perceptrón. Convierte el resultado en un clasificador binario estricto (0 o 1). Su principal problema es que su gradiente (derivada) es cero en casi todas partes, lo que la hace inservible para el entrenamiento moderno con Backpropagation."
                    type="escalon"
                />
                <ActivationCard
                    title="Sigmoide (Sigmoid)"
                    formula={<span>f(z) = 1 / (1 + e<sup>-z</sup>)</span>}
                    desc="Suaviza el escalón clásico. Transforma cualquier valor real a un rango exacto entre 0 y 1, lo que la hace excelente para predecir probabilidades binarias. Su desventaja: tiende a saturarse en los extremos, causando el famoso problema de 'desvanecimiento del gradiente'."
                    type="sigmoide"
                />
                <ActivationCard
                    title="Tangente Hiperbólica (Tanh)"
                    formula={<span>f(z) = (e<sup>z</sup> - e<sup>-z</sup>) / (e<sup>z</sup> + e<sup>-z</sup>)</span>}
                    desc="Muy similar a la Sigmoide, pero matemáticamente centrada en el cero, entregando salidas en el rango de -1 a 1. Generalmente hace que el modelo converja más rápido que la sigmoide, aunque hereda el mismo problema de saturación en los extremos."
                    type="tanh"
                />
                <ActivationCard
                    title="ReLU (Rectified Linear Unit)"
                    formula={<span>f(z) = max(0, z)</span>}
                    desc="La función más utilizada en las capas ocultas hoy en día. Es computacionalmente muy eficiente (solo descarta los negativos). Lo más importante: al no tener un límite superior, ayuda a evitar que los gradientes desaparezcan, permitiendo redes más profundas."
                    type="relu"
                />
                <ActivationCard
                    title="Lineal (Identidad)"
                    formula={<span>f(z) = z</span>}
                    desc="Devuelve exactamente el mismo valor que recibe. No aplica ninguna no-linealidad. Se usa casi exclusivamente en la capa de salida cuando el problema es de Regresión (por ejemplo, predecir el precio de una casa en dólares)."
                    type="lineal"
                />
                <ActivationCard
                    title="Softmax"
                    formula={<span>f(z<sub>i</sub>) = e<sup>z<sub>i</sub></sup> / Σ e<sup>z<sub>j</sub></sup></span>}
                    desc="Toma un vector de números y los transforma en una distribución de probabilidades (valores entre 0 y 1, que suman 1). Es la función estándar e indispensable para la capa de salida en problemas de Clasificación Multiclase (por ejemplo, clasificar qué raza es un perro entre 10 posibles)."
                    type="softmax"
                />
            </div>
        </div>
    );
};

const TabLossFunctions = () => {
    const LossCard = ({ title, kerasName, type, desc, recommendation }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-gray-800">{title}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded ${type === 'Regresión' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {type}
                </span>
            </div>
            <div className="bg-[#1e1e1e] text-green-400 font-mono text-xs p-3 rounded flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-400" />
                <span>loss='{kerasName}'</span>
            </div>
            <p className="text-sm text-gray-600 text-justify flex-grow">{desc}</p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded text-xs text-gray-800 mt-auto shadow-sm">
                <strong className="text-orange-800">Recomendación de uso:</strong> {recommendation}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in flex flex-col gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm text-gray-700 flex flex-col md:flex-row gap-4 items-center">
                <Target className="w-12 h-12 text-blue-500 shrink-0" />
                <div>
                    <h3 className="font-bold text-lg mb-1">Funciones de Pérdida (Loss Functions) en Keras</h3>
                    <p className="text-sm">
                        La función de pérdida es la forma en que la red neuronal mide "qué tan equivocada" está.
                        Elegir la función correcta es crucial, ya que el modelo optimizará sus pesos exclusivamente para minimizar este valor numérico.
                        Se dividen principalmente en dos grandes grupos según el tipo de problema: <strong>Regresión</strong> (predecir valores continuos) y <strong>Clasificación</strong> (predecir categorías).
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Regresión */}
                <LossCard
                    title="Error Cuadrático Medio"
                    kerasName="mse"
                    type="Regresión"
                    desc="Calcula el promedio de las diferencias al cuadrado entre el valor real y la predicción. Al elevar al cuadrado, penaliza fuertemente los errores grandes."
                    recommendation="Usa 'mse' por defecto en casi cualquier problema de regresión (ej. predecir precios, temperaturas, ventas), a menos que tengas muchos datos atípicos (outliers)."
                />
                <LossCard
                    title="Error Absoluto Medio"
                    kerasName="mae"
                    type="Regresión"
                    desc="Calcula el promedio de las diferencias absolutas. A diferencia del MSE, no eleva al cuadrado, por lo que trata a todos los errores de manera lineal y equitativa."
                    recommendation="Úsala si tu conjunto de datos tiene muchos valores atípicos (outliers) extremos que no quieres que desvíen drásticamente el entrenamiento de tu modelo."
                />
                <LossCard
                    title="Pérdida de Huber"
                    kerasName="huber"
                    type="Regresión"
                    desc="Una combinación inteligente: se comporta como MSE para errores pequeños (suave y derivable) y como MAE para errores grandes (lineal robusto)."
                    recommendation="Excelente alternativa avanzada al MSE si quieres lo mejor de ambos mundos: buena convergencia cerca del mínimo y gran resistencia frente a outliers."
                />

                {/* Clasificación */}
                <LossCard
                    title="Entropía Cruzada Binaria"
                    kerasName="binary_crossentropy"
                    type="Clasificación"
                    desc="Mide la distancia logarítmica entre dos distribuciones de probabilidad (la real y la predicha). Está diseñada matemáticamente para problemas de solo 2 clases (0 o 1)."
                    recommendation="Obligatoria para clasificación binaria (ej. 'Es Spam' vs 'No es Spam'). ¡Asegúrate de que la función de activación de tu última capa sea 'sigmoid'!"
                />
                <LossCard
                    title="Entropía Cruzada Categórica"
                    kerasName="categorical_crossentropy"
                    type="Clasificación"
                    desc="La extensión de la entropía cruzada para múltiples clases. Espera que las etiquetas reales estén codificadas en formato 'One-Hot' (ej. [0, 1, 0, 0])."
                    recommendation="Úsala en clasificación multiclase (ej. identificar números del 0 al 9) cuando tus datos objetivo estén en formato One-Hot. La última capa debe usar 'softmax'."
                />
                <LossCard
                    title="Entropía Cruzada Cat. Dispersa"
                    kerasName="sparse_categorical_crossentropy"
                    type="Clasificación"
                    desc="Hace exactamente el mismo cálculo matemático que la categórica estándar, pero espera que tus etiquetas sean números enteros (ej. clase 3) en lugar de arreglos One-Hot."
                    recommendation="Úsala para clasificación multiclase si quieres ahorrar memoria y tiempo al no convertir tus etiquetas enteras a matrices One-Hot gigantes."
                />
            </div>
        </div>
    );
};
const TabOptimizers = () => {
    const OptimizerCard = ({ title, kerasName, desc, recommendation }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-gray-800">{title}</h4>
            </div>
            <div className="bg-[#1e1e1e] text-purple-400 font-mono text-xs p-3 rounded flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-400" />
                <span>optimizer='{kerasName}'</span>
            </div>
            <p className="text-sm text-gray-600 text-justify flex-grow">{desc}</p>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded text-xs text-gray-800 mt-auto shadow-sm">
                <strong className="text-purple-800">Recomendación de uso:</strong> {recommendation}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in flex flex-col gap-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-lg shadow-sm text-gray-700 flex flex-col md:flex-row gap-4 items-center">
                <Rocket className="w-12 h-12 text-purple-500 shrink-0" />
                <div>
                    <h3 className="font-bold text-lg mb-1">Optimizadores en Keras</h3>
                    <p className="text-sm">
                        Si la Función de Pérdida es la "brújula" que indica dónde está el error, el <strong>Optimizador</strong> es el "motor" que mueve los pesos para llegar al mínimo. Define <em>cómo</em> y <em>qué tan rápido</em> se actualizan los parámetros (pesos y sesgos) basándose en los gradientes calculados mediante Backpropagation.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <OptimizerCard
                    title="SGD (Stochastic Gradient Descent)"
                    kerasName="sgd"
                    desc="El algoritmo clásico por excelencia. Actualiza los pesos usando la tasa de aprendizaje fija multiplicada por el gradiente. Por sí solo puede atascarse fácilmente en mínimos locales o valles llanos si no se configura con un parámetro llamado 'Momentum'."
                    recommendation="Úsalo (con Momentum activado) en arquitecturas muy estudiadas de visión artificial (como ResNet) donde se ha demostrado empíricamente que puede generalizar ligeramente mejor que Adam."
                />
                <OptimizerCard
                    title="RMSprop"
                    kerasName="rmsprop"
                    desc="Adapta la tasa de aprendizaje para cada peso individualmente dividiendo el gradiente por una media móvil de gradientes recientes. Soluciona el problema de SGD de moverse muy lento en dimensiones planas."
                    recommendation="Históricamente es el optimizador por excelencia para Redes Neuronales Recurrentes (RNN, LSTM) trabajando con datos secuenciales (texto o series temporales)."
                />
                <OptimizerCard
                    title="Adam (Adaptive Moment Estimation)"
                    kerasName="adam"
                    desc="El rey actual indiscutible. Combina las mejores ideas de RMSprop (tasa de aprendizaje adaptativa) y el Momentum de SGD (inercia direccional). Es rápido, computacionalmente eficiente y requiere muy poca configuración."
                    recommendation="Tu opción por defecto absoluta para el 95% de los problemas de Deep Learning. Si no sabes qué optimizador usar, ¡empieza siempre con Adam!"
                />
                <OptimizerCard
                    title="AdamW"
                    kerasName="adamw"
                    desc="Una variante moderna de Adam que corrige matemáticamente cómo se aplica la regularización 'Weight Decay' (Decaimiento de pesos). Evita que los pesos crezcan demasiado y reduce significativamente el sobreajuste (overfitting)."
                    recommendation="Altamente recomendado para entrenar modelos profundos complejos y el estándar moderno para arquitecturas Transformer (como las de los modelos GPT/LLMs)."
                />
                <OptimizerCard
                    title="Adagrad"
                    kerasName="adagrad"
                    desc="Adapta la tasa de aprendizaje disminuyéndola drásticamente para los parámetros que se actualizan frecuentemente y manteniéndola alta para aquellos que rara vez se activan."
                    recommendation="Útil casi exclusivamente si estás trabajando con datos muy dispersos (sparse data), como sistemas de recomendación con procesamiento de lenguaje natural básico o matrices ralas."
                />
                <OptimizerCard
                    title="Nadam"
                    kerasName="nadam"
                    desc="Esencialmente Adam combinado con Momentum de Nesterov. Nesterov se diferencia porque 'mira hacia adelante' (calcula el gradiente en la posición futura proyectada), lo que suele dar actualizaciones un poco más estables."
                    recommendation="Pruébalo como un reemplazo directo de Adam en la etapa final de tu proyecto, si quieres intentar exprimir ese último 1% de precisión sin cambiar tu arquitectura."
                />
            </div>
        </div>
    );
};

const Tab6Glossary = () => {
    const glossaryItems = [
        {
            symbol: "x",
            term: "Entrada (Input / Feature)",
            desc: "Los datos crudos que alimentan la red. Pueden ser los pixeles de una imagen, la edad de un cliente, palabras en un texto, etc."
        },
        {
            symbol: "w",
            term: "Peso (Weight)",
            desc: "La 'fuerza' o importancia de una conexión entre dos neuronas. Es el parámetro principal que la red modifica durante el aprendizaje."
        },
        {
            symbol: "b",
            term: "Sesgo (Bias)",
            desc: "Un valor constante extra que se suma a la neurona. Permite desplazar la barrera de decisión (como la 'b' en la ecuación de la recta y = mx + b)."
        },
        {
            symbol: "z",
            term: "Suma Ponderada",
            desc: "El cálculo interno lineal de una neurona antes de la activación. Ecuación: z = (w₁x₁ + w₂x₂ ...) + b."
        },
        {
            symbol: "a",
            term: "Activación (Salida de Neurona)",
            desc: "El resultado numérico de pasar 'z' por una función matemática no lineal (como ReLU o Sigmoide). Es lo que la neurona 'dispara' hacia la siguiente capa."
        },
        {
            symbol: "ŷ",
            term: "Predicción Final (Y-hat)",
            desc: "La salida o activación definitiva de la capa final. Es la respuesta final que arroja el modelo (ej. '95% de probabilidad' o 'Precio: $50,000')."
        },
        {
            symbol: "L",
            term: "Pérdida (Loss / Error)",
            desc: "Una métrica matemática que calcula qué tan equivocada estuvo nuestra predicción (ŷ) frente a la realidad observada o esperada (y)."
        },
        {
            symbol: "MSE",
            term: "Error Cuadrático Medio",
            desc: "Acrónimo de Mean Squared Error. Es la función de pérdida (Loss) más común para problemas de regresión. Calcula el promedio de las diferencias al cuadrado entre ŷ y y."
        },
        {
            symbol: "∂L/∂w",
            term: "Gradiente (Derivada)",
            desc: "La brújula matemática. Nos dice cómo cambiaría el error (L) si modificamos pequeñamente un peso (w). Si es positivo, reducimos el peso; si es negativo, lo aumentamos."
        },
        {
            symbol: "α",
            term: "Tasa de Aprendizaje (Learning Rate)",
            desc: "El tamaño del paso que damos para corregir los pesos en la dirección del gradiente. Muy alto: la red rebota caóticamente. Muy bajo: tarda una eternidad en aprender."
        },
        {
            symbol: "E",
            term: "Época (Epoch)",
            desc: "Un ciclo completo de entrenamiento. Ocurre cuando absolutamente toda la base de datos de entrenamiento ha pasado por la red hacia adelante y hacia atrás una vez."
        },
        {
            symbol: "FP",
            term: "Paso Forward",
            desc: "La propagación hacia adelante. Es el viaje de los datos desde la capa de entrada, fluyendo a través de todas las neuronas de la red, hasta generar la predicción final (ŷ)."
        },
        {
            symbol: "BP",
            term: "Backpropagation",
            desc: "La propagación hacia atrás. El algoritmo motor del entrenamiento que calcula los gradientes de error desde la capa de salida hasta la de entrada para ajustar los pesos."
        },
        {
            symbol: "h",
            term: "Capa Oculta (Hidden Layer)",
            desc: "Las capas intermedias de la red, ubicadas entre la entrada y la salida. Son las responsables de extraer y combinar patrones complejos de los datos."
        },
        {
            symbol: "MLP",
            term: "Perceptrón Multicapa",
            desc: "Acrónimo de Multi-Layer Perceptron. Es la arquitectura de red neuronal profunda más clásica, compuesta por capas densamente conectadas entre sí."
        }
    ];

    return (
        <div className="animate-fade-in flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-2">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-red-600" />
                    Glosario y Notación Matemática
                </h2>
                <p className="text-gray-600">
                    El Deep Learning está lleno de letras y símbolos que pueden parecer abrumadores. Utiliza esta tabla como tu mapa de traducción para recordar qué significa cada término matemático en lenguaje sencillo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {glossaryItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-gray-200">
                            <span className="font-bold text-gray-800">{item.term}</span>
                            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center border border-gray-300 shadow-inner">
                                <span className="font-serif italic font-bold text-red-700 text-lg">{item.symbol}</span>
                            </div>
                        </div>
                        <div className="p-4 text-sm text-gray-600 text-justify flex-grow">
                            {item.desc}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Tab7ArchitectureToCode = () => {
    const [inputUnits, setInputUnits] = useState(2);
    const [outputUnits, setOutputUnits] = useState(1);
    const [outputActivation, setOutputActivation] = useState('sigmoid');

    const [hiddenLayers, setHiddenLayers] = useState([
        { id: 'h1', units: 4, activation: 'relu' },
        { id: 'h2', units: 4, activation: 'relu' }
    ]);

    const [newUnits, setNewUnits] = useState(4);
    const [newActivation, setNewActivation] = useState('relu');

    const handleAddLayer = () => {
        if (hiddenLayers.length >= 4) return;
        setHiddenLayers([
            ...hiddenLayers,
            { id: `dense_${Date.now()}`, units: newUnits, activation: newActivation }
        ]);
    };

    const handleReset = () => {
        setHiddenLayers([]);
        setInputUnits(2);
        setOutputUnits(1);
        setOutputActivation('sigmoid');
    };

    const svgLayersArray = [inputUnits, ...hiddenLayers.map(l => l.units), outputUnits];
    const allDenseLayers = [...hiddenLayers, { id: 'output', units: outputUnits, activation: outputActivation, isOutput: true }];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6 text-red-600" />
                    De la Arquitectura al Código (Keras)
                </h2>
                <p className="text-gray-600">
                    Diseña tu propia Red Neuronal (MLP) paso a paso. Configura las <strong>entradas y salidas</strong>, y agrega capas ocultas.
                    Observa cómo la representación visual interactúa y genera automáticamente el código en Python usando <strong>TensorFlow/Keras</strong>.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-gray-500" /> Constructor de Arquitectura
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Capa de Entrada (Features)</label>
                                <input
                                    type="number" min="1" max="10"
                                    value={inputUnits}
                                    onChange={(e) => setInputUnits(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Capa de Salida</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number" min="1" max="10"
                                        value={outputUnits}
                                        onChange={(e) => setOutputUnits(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                        className="w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        title="Neuronas de salida"
                                    />
                                    <select
                                        value={outputActivation}
                                        onChange={(e) => setOutputActivation(e.target.value)}
                                        className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="sigmoid">Sigmoide</option>
                                        <option value="softmax">Softmax</option>
                                        <option value="linear">Lineal</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Añadir Capa Oculta</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="w-full sm:w-1/3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Neuronas</label>
                                    <input
                                        type="number"
                                        min="1" max="16"
                                        value={newUnits}
                                        onChange={(e) => setNewUnits(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Activación</label>
                                    <select
                                        value={newActivation}
                                        onChange={(e) => setNewActivation(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="relu">ReLU</option>
                                        <option value="sigmoid">Sigmoide</option>
                                        <option value="tanh">Tanh</option>
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/3 flex gap-2">
                                    <button
                                        onClick={handleAddLayer}
                                        disabled={hiddenLayers.length >= 4}
                                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        title={hiddenLayers.length >= 4 ? "Límite de capas ocultas alcanzado" : "Añadir Capa"}
                                    >
                                        <PlusCircle className="w-4 h-4" /> Añadir
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Capas ocultas: {hiddenLayers.length} / 4</span>
                            <button onClick={handleReset} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Reiniciar Red
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-72 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">Arquitectura Visual</h3>
                        <div className="w-full flex-grow bg-slate-50 rounded-xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
                            <NeuralNetworkSVG layers={svgLayersArray} colorMode="architecture" />
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-gray-600">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#dcfce7] border-2 border-[#16a34a]"></span> Entrada
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#eff6ff] border-2 border-[#2563eb]"></span> Oculta
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ffedd5] border-2 border-[#ea580c]"></span> Salida
                            </span>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 bg-[#1e1e1e] p-6 rounded-xl shadow-lg border border-gray-800 font-mono text-sm relative flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2 font-sans border-b border-gray-700 pb-2">
                        <Code className="w-5 h-5 text-green-400" /> Código Autogenerado
                    </h3>

                    <pre className="text-gray-300 leading-relaxed overflow-x-auto flex-grow hide-scrollbar">
                        <span className="text-blue-400">from</span> tensorflow.keras.models <span className="text-blue-400">import</span> Sequential{'\n'}
                        <span className="text-blue-400">from</span> tensorflow.keras.layers <span className="text-blue-400">import</span> Dense{'\n\n'}

                        <span className="text-gray-500"># 1. Inicializar el modelo secuencial</span>{'\n'}
                        model = Sequential(){'\n\n'}

                        <span className="text-gray-500"># 2. Añadir capas de la arquitectura</span>{'\n'}
                        {allDenseLayers.map((layer, idx) => {
                            const isFirstDense = idx === 0;
                            const inputDimStr = isFirstDense ? `, input_dim=${inputUnits}` : '';

                            let comment = '';
                            if (layer.isOutput) {
                                comment = `# Capa de Salida`;
                            } else if (isFirstDense) {
                                comment = `# Capa Oculta 1 (Define también las ${inputUnits} entradas)`;
                            } else {
                                comment = `# Capa Oculta ${idx + 1}`;
                            }

                            return (
                                <div key={layer.id} className="animate-fade-in my-1">
                                    <span className="text-gray-500">{comment}</span>{'\n'}
                                    model.add(Dense(<span className="text-orange-300">{layer.units}</span>{inputDimStr}, activation=<span className="text-green-300">'{layer.activation}'</span>))
                                </div>
                            );
                        })}

                        <div className="animate-fade-in mt-6 opacity-80">
                            <span className="text-gray-500"># 3. Compilar el modelo</span>{'\n'}
                            model.compile(optimizer=<span className="text-green-300">'adam'</span>, loss=<span className="text-green-300">'mse'</span>)
                        </div>
                    </pre>
                </div>
            </div>
        </div>
    );
};

const Tab8Bibliography = () => {
    return (
        <div className="animate-fade-in flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <Library className="w-6 h-6 text-red-600" />
                    Bibliografía y Enlaces de Interés
                </h2>
                <p className="text-gray-600 mb-6">
                    Para dominar el Deep Learning, combinar libros teóricos con cursos prácticos es la mejor estrategia.
                    Aquí tienes una selección de los mejores recursos disponibles, categorizados para que elijas según tu perfil de aprendizaje.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col gap-3">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b border-slate-300 pb-2">
                            <BookOpen className="w-5 h-5 text-blue-600" /> Libros Fundamentales
                        </h3>

                        <a href="https://www.deeplearningbook.org/" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-blue-400 hover:shadow-sm transition">
                            <h4 className="font-bold text-blue-700 group-hover:underline">Deep Learning (Ian Goodfellow, et al.)</h4>
                            <p className="text-xs text-gray-600 mt-1">La "Biblia" del Deep Learning. Muy riguroso matemáticamente. Excelente para ingenieros que quieran entender las matemáticas subyacentes. (Gratis online)</p>
                        </a>

                        <a href="http://neuralnetworksanddeeplearning.com/" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-blue-400 hover:shadow-sm transition">
                            <h4 className="font-bold text-blue-700 group-hover:underline">Neural Networks and Deep Learning (Michael Nielsen)</h4>
                            <p className="text-xs text-gray-600 mt-1">El mejor libro introductorio para construir la intuición. Te lleva de la mano a programar tu primera red neuronal desde cero. (Gratis online)</p>
                        </a>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col gap-3">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b border-slate-300 pb-2">
                            <Play className="w-5 h-5 text-green-600" /> Cursos y Certificaciones
                        </h3>

                        <a href="https://www.coursera.org/specializations/deep-learning" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-green-400 hover:shadow-sm transition">
                            <h4 className="font-bold text-green-700 group-hover:underline">Deep Learning Specialization (Andrew Ng)</h4>
                            <p className="text-xs text-gray-600 mt-1">El curso más famoso del mundo sobre el tema. Balancea perfectamente la teoría con implementaciones en Python. Ideal para todos los perfiles.</p>
                        </a>

                        <a href="https://course.fast.ai/" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-green-400 hover:shadow-sm transition">
                            <h4 className="font-bold text-green-700 group-hover:underline">Practical Deep Learning for Coders (fast.ai)</h4>
                            <p className="text-xs text-gray-600 mt-1">Enfoque "Top-Down". Te enseñan primero a entrenar modelos de vanguardia y luego explican cómo funcionan por dentro. Muy recomendado.</p>
                        </a>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col gap-3 md:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 border-b border-slate-300 pb-2">
                            <Youtube className="w-5 h-5 text-red-600" /> Canales de YouTube Recomendados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a href="https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-red-400 hover:shadow-sm transition">
                                <h4 className="font-bold text-red-700 group-hover:underline">3Blue1Brown: Serie Redes Neuronales</h4>
                                <p className="text-xs text-gray-600 mt-1">Las mejores animaciones matemáticas de internet. Es obligatorio ver esta lista de reproducción para entender visualmente el álgebra matricial.</p>
                            </a>
                            <a href="https://www.youtube.com/c/DotCSV" target="_blank" rel="noopener noreferrer" className="group block bg-white p-3 rounded border border-gray-200 hover:border-red-400 hover:shadow-sm transition">
                                <h4 className="font-bold text-red-700 group-hover:underline">DotCSV</h4>
                                <p className="text-xs text-gray-600 mt-1">El mejor canal de divulgación sobre IA en español. Sus videos explicando arquitecturas y papers recientes son excelentes para mantenerse actualizado.</p>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};


// --- APLICACIÓN PRINCIPAL ---

export default function App() {
    const [activeTab, setActiveTab] = useState(1);

    const tabs = [
        { id: 1, title: "1. ¿Qué es DL?", icon: <Brain className="w-4 h-4" /> },
        { id: 2, title: "2. Perceptrón Simple", icon: <Network className="w-4 h-4" /> },
        { id: 3, title: "3. Entrenamiento", icon: <Calculator className="w-4 h-4" /> },
        { id: 4, title: "4. Red Multicapa", icon: <Layers className="w-4 h-4" /> },
        { id: 5, title: "5. Backpropagation", icon: <GitMerge className="w-4 h-4" /> },
        { id: 6, title: "6. Funciones Activación", icon: <TrendingUp className="w-4 h-4" /> },
        { id: 7, title: "7. Funciones Pérdida", icon: <Target className="w-4 h-4" /> },
        { id: 8, title: "8. Optimizadores", icon: <Rocket className="w-4 h-4" /> },
        { id: 9, title: "9. Glosario", icon: <BookOpen className="w-4 h-4" /> },
        { id: 10, title: "10. Arquitectura a Código", icon: <Code className="w-4 h-4" /> },
        { id: 11, title: "11. Bibliografía", icon: <Library className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .reverse-dash { stroke-dashoffset: 100; animation: dashReverse 2s linear infinite; }
        @keyframes dashReverse { to { stroke-dashoffset: 0; } }
      `}} />

            <header className="bg-[#c8102e] text-white shadow-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Deep Learning</h1>
                        <p className="text-red-100 text-sm font-medium">Redes Neuronales</p>
                    </div>
                    <div className="bg-black/20 px-4 py-2 rounded backdrop-blur-sm text-sm border border-white/10">
                        Módulo Interactivo
                    </div>
                </div>
            </header>

            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                                        ? 'border-[#c8102e] text-[#c8102e] bg-red-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {activeTab === 1 && <TabIntro />}
                {activeTab === 2 && <Tab1Perceptron />}
                {activeTab === 3 && <Tab2GradientDescent />}
                {activeTab === 4 && <Tab3ForwardPass />}
                {activeTab === 5 && <Tab4Backpropagation />}
                {activeTab === 6 && <Tab5ActivationFunctions />}
                {activeTab === 7 && <TabLossFunctions />}
                {activeTab === 8 && <TabOptimizers />}
                {activeTab === 9 && <Tab6Glossary />}
                {activeTab === 10 && <Tab7ArchitectureToCode />}
                {activeTab === 11 && <Tab8Bibliography />}
            </main>

            <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
                <p>Diseñado para el módulo de Aprendizaje Profundo - Especialización en Ciencia de Datos e Inteligencia Artificial</p>
            </footer>
        </div>
    );
}
