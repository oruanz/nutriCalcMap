import { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react'; // IMPORTAÇÃO DA BIBLIOTECA
import { 
  Calculator, Moon, Sun, Dumbbell, Download, PieChart, 
  Droplet, TrendingUp, Calendar, Globe, ExternalLink, 
  AlertCircle, Printer, HelpCircle, MessageSquare, Heart, X, Coffee
} from 'lucide-react';

// --- Interfaces ---
interface NutritionResult {
  tmb: number;
  get: number;
  vet: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinCal: number;
  carbCal: number;
  fatCal: number;
  imc: string;
  waterIntake: number;
  weight: number;
  height: number;
  age: number;
  bodyFat: string | null;
  proteinPerKg: string;
  fatPerKg: string;
  formulaUsed: string;
}

interface MealTemplate {
  meals: number;
  name: string;
  distribution: number[];
  labels: string[];
}

interface FormErrors {
  weight: boolean;
  height: boolean;
  age: boolean;
  bodyFat: boolean;
}

export default function MapynguaCalculator() {
  const [darkMode, setDarkMode] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // --- AutoAnimate Refs ---
  // Criamos refs para cada seção que muda de tamanho ou conteúdo
  const [parentRef] = useAutoAnimate(); // Container principal (para quando os resultados aparecem)
  const [buttonsRef] = useAutoAnimate(); // Para a área dos botões de ação
  const [mealsRef] = useAutoAnimate(); // Para a grade de refeições
  const [popupParentRef] = useAutoAnimate(); // Para o Popup de doação
  const [formRef] = useAutoAnimate(); // Para mensagens de erro no formulário

  // --- Estados do Formulário ---
  const [clientName, setClientName] = useState(''); 
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('1.55');
  const [goal, setGoal] = useState('maintenance');
  const [customCalories, setCustomCalories] = useState('0');
  const [proteinPerKg, setProteinPerKg] = useState('2.0');
  const [fatPerKg, setFatPerKg] = useState('1.0');
  const [bodyFat, setBodyFat] = useState('');
  const [unit, setUnit] = useState('metric');
  const [numMeals, setNumMeals] = useState('5');
  const [tmbFormula, setTmbFormula] = useState('mifflin');

  // --- Estados de Doação ---
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  // Estado de Erros
  const [errors, setErrors] = useState<FormErrors>({
    weight: false,
    height: false,
    age: false,
    bodyFat: false
  });

  const [results, setResults] = useState<NutritionResult | null>(null);

  // --- Persistência de Dados ---
  useEffect(() => {
    const savedData = localStorage.getItem('mapyngua_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setClientName(parsed.clientName || '');
      setGender(parsed.gender || 'male');
      setWeight(parsed.weight || '');
      setHeight(parsed.height || '');
      setAge(parsed.age || '');
      setActivityLevel(parsed.activityLevel || '1.55');
      setGoal(parsed.goal || 'maintenance');
      setProteinPerKg(parsed.proteinPerKg || '2.0');
      setFatPerKg(parsed.fatPerKg || '1.0');
      setNumMeals(parsed.numMeals || '5');
      setBodyFat(parsed.bodyFat || '');
      setTmbFormula(parsed.tmbFormula || 'mifflin');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      const dataToSave = {
        clientName, gender, weight, height, age, activityLevel, 
        goal, proteinPerKg, fatPerKg, numMeals, bodyFat, tmbFormula
      };
      localStorage.setItem('mapyngua_data', JSON.stringify(dataToSave));
    }
  }, [clientName, gender, weight, height, age, activityLevel, goal, proteinPerKg, fatPerKg, numMeals, bodyFat, tmbFormula, loaded]);

  // --- Templates de Refeição ---
  const mealTemplates: MealTemplate[] = [
    { 
      meals: 3, 
      name: '3 Refeições', 
      distribution: [30, 40, 30], 
      labels: ['Café da Manhã', 'Almoço', 'Jantar']
    },
    { 
      meals: 4, 
      name: '4 Refeições', 
      distribution: [25, 35, 15, 25], 
      labels: ['Café da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar']
    },
    { 
      meals: 5, 
      name: '5 Refeições', 
      distribution: [20, 30, 15, 25, 10], 
      labels: ['Café da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']
    },
    { 
      meals: 6, 
      name: '6 Refeições', 
      distribution: [20, 10, 30, 15, 20, 5], 
      labels: ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']
    }
  ];

  const convertToMetric = (value: number, type: 'weight' | 'height' | string) => {
    if (unit === 'metric') return value;
    if (type === 'weight') return value * 0.453592;
    if (type === 'height') return value * 2.54;
    return value;
  };

  const calculateNutrition = () => {
    // Validação
    const newErrors = {
      weight: !weight,
      height: !height,
      age: !age,
      bodyFat: tmbFormula === 'katch' && !bodyFat
    };
    setErrors(newErrors);

    if (newErrors.weight || newErrors.height || newErrors.age) {
      alert('Por favor, preencha os campos obrigatórios marcados em vermelho.');
      return;
    }

    if (newErrors.bodyFat) {
      alert('A fórmula Katch-McArdle exige o % de Gordura. Preencha ou mude a fórmula.');
      return;
    }

    const w = convertToMetric(parseFloat(weight), 'weight');
    const h = convertToMetric(parseFloat(height), 'height');
    const a = parseFloat(age);
    const bf = parseFloat(bodyFat);
    const activity = parseFloat(activityLevel);
    const protein = parseFloat(proteinPerKg);
    const fat = parseFloat(fatPerKg);

    let tmb;
    
    if (tmbFormula === 'harris') {
      if (gender === 'male') {
        tmb = 66.5 + (13.75 * w) + (5.003 * h) - (6.755 * a);
      } else {
        tmb = 655.1 + (9.563 * w) + (1.850 * h) - (4.676 * a);
      }
    } else if (tmbFormula === 'katch') {
      const lbm = w * (1 - bf / 100);
      tmb = 370 + (21.6 * lbm);
    } else {
      if (gender === 'male') {
        tmb = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        tmb = 10 * w + 6.25 * h - 5 * a - 161;
      }
    }

    const get = tmb * activity;

    let vet;
    const customAdj = parseFloat(customCalories);
    if (goal === 'cut') {
      vet = get - 400 + customAdj;
    } else if (goal === 'bulk') {
      vet = get + 400 + customAdj;
    } else {
      vet = get + customAdj;
    }

    const proteinGrams = protein * w;
    const fatGrams = fat * w;
    
    const proteinCal = proteinGrams * 4;
    const fatCal = fatGrams * 9;
    
    const carbCal = vet - proteinCal - fatCal;
    const carbGrams = carbCal / 4;

    const heightM = h / 100;
    const imc = w / (heightM * heightM);
    const waterIntake = w * 35;

    const calculatedResults: NutritionResult = {
      tmb: Math.round(tmb),
      get: Math.round(get),
      vet: Math.round(vet),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams),
      proteinCal: Math.round(proteinCal),
      carbCal: Math.round(carbCal),
      fatCal: Math.round(fatCal),
      imc: imc.toFixed(1),
      waterIntake: Math.round(waterIntake),
      weight: w,
      height: h,
      age: a,
      bodyFat: bodyFat || null,
      proteinPerKg: proteinPerKg,
      fatPerKg: fatPerKg,
      formulaUsed: tmbFormula === 'harris' ? 'Harris-Benedict' : tmbFormula === 'katch' ? 'Katch-McArdle' : 'Mifflin-St Jeor'
    };

    setResults(calculatedResults);
    
    setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    if (!hasShownPopup) {
      setTimeout(() => {
        setShowDonationPopup(true);
        setHasShownPopup(true);
      }, 3000); 
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToWhatsApp = () => {
    if (!results) return;
    const template = mealTemplates.find(t => t.meals === parseInt(numMeals));
    if (!template) return;

    let mealText = '';
    template.distribution.forEach((percent, index) => {
      const calories = Math.round((results.vet * percent) / 100);
      const protein = Math.round((results.protein * percent) / 100);
      const carbs = Math.round((results.carbs * percent) / 100);
      const fat = Math.round((results.fat * percent) / 100);
      
      mealText += `\n🕒 *${template.labels[index]}* (${calories} kcal)\n🥩 P: ${protein}g | 🍠 C: ${carbs}g | 🥑 G: ${fat}g\n`;
    });

    const text = `🥑 *PLANO NUTRICIONAL - MAPYNGUA*
👤 *Aluno:* ${clientName || 'Visitante'}
🎯 *Objetivo:* ${goal === 'cut' ? 'Emagrecimento' : goal === 'bulk' ? 'Hipertrofia' : 'Manutenção'}

🔥 *Metas Diárias:*
• Calorias: *${results.vet} kcal*
• Proteína: ${results.protein}g
• Carbo: ${results.carbs}g
• Gordura: ${results.fat}g
• Água: ${(results.waterIntake/1000).toFixed(1)}L

🍽️ *Distribuição:*
${mealText}
🚀 _Gerado por Mapyngua Nutrition_`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Resumo copiado! Agora é só colar no WhatsApp.');
    });
  };

  const exportToTXT = () => {
    if (!results) return;
    const template = mealTemplates.find(t => t.meals === parseInt(numMeals));
    if (!template) return;

    let mealDistribution = '\n\nDISTRIBUIÇÃO POR REFEIÇÃO:\n';
    template.distribution.forEach((percent, index) => {
      const calories = Math.round((results.vet * percent) / 100);
      const protein = Math.round((results.protein * percent) / 100);
      const carbs = Math.round((results.carbs * percent) / 100);
      const fat = Math.round((results.fat * percent) / 100);
      
      mealDistribution += `\n${template.labels[index]}:
  - ${calories} kcal (${percent}%)
  - Proteína: ${protein}g
  - Carboidrato: ${carbs}g
  - Gordura: ${fat}g\n`;
    });
    
    const content = `MAPYNGUA NUTRITION - PLANO ALIMENTAR
ALUNO: ${clientName ? clientName.toUpperCase() : 'AVALIAÇÃO'}
DATA: ${new Date().toLocaleDateString('pt-BR')}
FÓRMULA: ${results.formulaUsed}

DADOS:
Peso: ${results.weight}kg | Altura: ${results.height}cm | IMC: ${results.imc}
Meta: ${results.vet} kcal

MACROS:
Proteína: ${results.protein}g (${results.proteinPerKg}g/kg)
Carboidrato: ${results.carbs}g
Gordura: ${results.fat}g (${results.fatPerKg}g/kg)

HIDRATAÇÃO: ${(results.waterIntake/1000).toFixed(1)}L

${mealDistribution}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mapyngua_${clientName || 'Plano'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-100';

  const getInputClass = (hasError: boolean) => 
    `w-full p-3 rounded-lg ${inputBg} ${textColor} border ${hasError ? 'border-red-500 focus:ring-red-500' : `${borderColor} focus:ring-emerald-500`} focus:ring-2 outline-none transition-all`;

  const currentTemplate = mealTemplates.find(t => t.meals === parseInt(numMeals));

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative flex items-center ml-2">
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-emerald-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300 flex flex-col print:min-h-0 print:block print:bg-white`}>
      {/* Aplicamos 'parentRef' aqui para animar a expansão suave da página 
        quando a seção de resultados aparece 
      */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 w-full flex-grow print:p-0 print:w-full print:max-w-none relative" ref={parentRef}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Mapyngua <span className="text-emerald-500">Nutrition</span>
              </h1>
              <p className={`text-sm ${textSecondary}`}>Calculadora Profissional para Personal Trainers</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${inputBg} hover:opacity-80 transition-opacity`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {/* --- FORMULÁRIO (Escondido na Impressão) --- */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 md:p-8 mb-6 border ${borderColor} print:hidden`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Dados do Aluno
            </h2>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={`w-full sm:w-auto px-3 py-2 rounded-lg ${inputBg} ${textColor} border ${borderColor} text-sm`}
            >
              <option value="metric">Métrico (kg/cm)</option>
              <option value="imperial">Imperial (lbs/in)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={formRef}>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Nome do Aluno
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="João Silva"
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Sexo
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary} flex items-center gap-1`}>
                Peso ({unit === 'metric' ? 'kg' : 'lbs'}) 
                <span className="text-red-500">*</span>
                {errors.weight && <AlertCircle className="w-3 h-3 text-red-500" />}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  if (errors.weight) setErrors({...errors, weight: false});
                }}
                placeholder={unit === 'metric' ? '70' : '154'}
                className={getInputClass(errors.weight)}
              />
              {/* O erro aparece suavemente com auto-animate */}
              {errors.weight && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary} flex items-center gap-1`}>
                Altura ({unit === 'metric' ? 'cm' : 'in'}) 
                <span className="text-red-500">*</span>
                {errors.height && <AlertCircle className="w-3 h-3 text-red-500" />}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  if (errors.height) setErrors({...errors, height: false});
                }}
                placeholder={unit === 'metric' ? '175' : '69'}
                className={getInputClass(errors.height)}
              />
              {errors.height && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary} flex items-center gap-1`}>
                Idade (anos) 
                <span className="text-red-500">*</span>
                {errors.age && <AlertCircle className="w-3 h-3 text-red-500" />}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors({...errors, age: false});
                }}
                placeholder="30"
                className={getInputClass(errors.age)}
              />
              {errors.age && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
            </div>

            {/* Gordura com Validação Condicional */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary} flex items-center gap-1`}>
                % Gordura
                {tmbFormula === 'katch' && <span className="text-red-500">*</span>}
                {errors.bodyFat && <AlertCircle className="w-3 h-3 text-red-500" />}
              </label>
              <input
                type="number"
                value={bodyFat}
                onChange={(e) => {
                  setBodyFat(e.target.value);
                  if (errors.bodyFat) setErrors({...errors, bodyFat: false});
                }}
                placeholder="15"
                className={getInputClass(errors.bodyFat)}
              />
              {errors.bodyFat && <p className="text-xs text-red-500 mt-1">Obrigatório para Katch-McArdle</p>}
            </div>

            {/* Seletor de Fórmula TMB */}
            <div>
              <div className="flex items-center mb-2">
                <label className={`block text-sm font-medium ${textSecondary}`}>
                  Fórmula TMB
                </label>
                <Tooltip text="Escolha a equação para calcular o Metabolismo Basal. Katch-McArdle é mais preciso para atletas com baixo % de gordura." />
              </div>
              <select
                value={tmbFormula}
                onChange={(e) => setTmbFormula(e.target.value)}
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              >
                <option value="mifflin">Mifflin-St Jeor (Padrão)</option>
                <option value="harris">Harris-Benedict (Clássica)</option>
                <option value="katch">Katch-McArdle (Atletas)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className={`block text-sm font-medium ${textSecondary}`}>
                  Nível de Atividade (NAF)
                </label>
                <Tooltip text="Fator multiplicador do TMB baseado no gasto calórico diário com exercícios." />
              </div>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              >
                <option value="1.2">Sedentário</option>
                <option value="1.375">Levemente Ativo (1-3x/sem)</option>
                <option value="1.55">Moderado (3-5x/sem)</option>
                <option value="1.725">Muito Ativo (6-7x/sem)</option>
                <option value="1.9">Extremamente Ativo</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Objetivo
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              >
                <option value="cut">Emagrecimento (-400 kcal)</option>
                <option value="maintenance">Manutenção</option>
                <option value="bulk">Hipertrofia (+400 kcal)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className={`block text-sm font-medium ${textSecondary}`}>
                  Ajuste Fino (kcal)
                </label>
                <Tooltip text="Adicione ou remova calorias extras manualmente do cálculo final." />
              </div>
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="0"
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
              <p className={`text-xs ${textSecondary} mt-1`}>-800 a +800 kcal extras</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Proteína (g/kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={proteinPerKg}
                onChange={(e) => setProteinPerKg(e.target.value)}
                placeholder="2.0"
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
              <p className={`text-xs ${textSecondary} mt-1`}>Recomendado: 1.8-2.2g</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Gordura (g/kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={fatPerKg}
                onChange={(e) => setFatPerKg(e.target.value)}
                placeholder="1.0"
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
              <p className={`text-xs ${textSecondary} mt-1`}>Recomendado: 0.8-1.2g</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Nº de Refeições
              </label>
              <select
                value={numMeals}
                onChange={(e) => setNumMeals(e.target.value)}
                className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
              >
                <option value="3">3 Refeições</option>
                <option value="4">4 Refeições</option>
                <option value="5">5 Refeições</option>
                <option value="6">6 Refeições</option>
              </select>
            </div>
          </div>

          {/* BOTÕES RESPONSIVOS - Com animação de entrada dos botões extras */}
          <div className="mt-8 space-y-3 sm:space-y-0 sm:flex sm:gap-3" ref={buttonsRef}>
            <button
              onClick={calculateNutrition}
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <Calculator className="w-5 h-5" />
              Calcular Dieta
            </button>
            
            {results && (
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="px-4 py-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center justify-center gap-2"
                  title="Imprimir PDF"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={copyToWhatsApp}
                  className="px-4 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                  title="Copiar para WhatsApp"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={exportToTXT}
                  className="px-4 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
                  title="Baixar Texto"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- RESULTADOS --- */}
        {results && (
          <div id="results-section">
            <div className="hidden print:block text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Plano Nutricional Personalizado</h1>
                <p className="text-gray-600 text-sm">Gerado por Mapyngua Nutrition Calculator</p>
                <div className="mt-2 border-b-2 border-emerald-500 w-16 mx-auto"></div>
            </div>

            {/* --- Resumo do Aluno (Apenas Impressão) --- */}
            <div className="hidden print:grid grid-cols-2 gap-x-8 gap-y-2 mb-6 p-4 border border-gray-200 rounded-lg text-sm bg-gray-50 break-inside-avoid">
              <h3 className="col-span-2 font-bold text-emerald-700 border-b border-gray-300 pb-1 mb-2">
                Resumo do Aluno
              </h3>
              <p><span className="font-semibold text-gray-700">Nome:</span> {clientName || 'Não informado'}</p>
              <p><span className="font-semibold text-gray-700">Objetivo:</span> {goal === 'cut' ? 'Emagrecimento' : goal === 'bulk' ? 'Hipertrofia' : 'Manutenção'}</p>
              <p><span className="font-semibold text-gray-700">Peso:</span> {weight} kg</p>
              <p><span className="font-semibold text-gray-700">Altura:</span> {height} cm</p>
              <p><span className="font-semibold text-gray-700">Idade:</span> {age} anos</p>
              <p><span className="font-semibold text-gray-700">IMC:</span> {results.imc}</p>
              <p><span className="font-semibold text-gray-700">Fórmula TMB:</span> {results.formulaUsed}</p>
            </div>

            <div className={`${cardBg} rounded-xl shadow-lg p-6 md:p-8 mb-6 border ${borderColor} print:shadow-none print:border-none print:p-0 print:mb-4 print:break-inside-avoid`}>
              <h2 className="text-xl font-semibold mb-6 text-emerald-500 flex items-center gap-2 print:text-emerald-700 print:mb-4 print:text-lg">
                <TrendingUp className="w-5 h-5" />
                Resultados da Avaliação
                {clientName && <span className="text-gray-500 dark:text-gray-400 print:text-gray-700 font-normal ml-2">- {clientName}</span>}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:grid-cols-4 print:gap-2 print:mb-6">
                <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:p-2`}>
                  <p className={`text-sm ${textSecondary} print:text-gray-600 mb-1`}>TMB</p>
                  <p className="text-2xl font-bold print:text-xl print:text-black">{results.tmb} kcal</p>
                  <p className={`text-xs ${textSecondary} print:text-gray-500 mt-1`}>Gasto em repouso</p>
                </div>
                <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:p-2`}>
                  <p className={`text-sm ${textSecondary} print:text-gray-600 mb-1`}>GET</p>
                  <p className="text-2xl font-bold print:text-xl print:text-black">{results.get} kcal</p>
                  <p className={`text-xs ${textSecondary} print:text-gray-500 mt-1`}>Gasto total diário</p>
                </div>
                <div className={`p-4 rounded-lg ${inputBg} border-2 border-emerald-500 print:border-emerald-600 print:bg-white print:text-black print:p-2`}>
                  <p className={`text-sm ${textSecondary} print:text-gray-600 mb-1`}>VET (Meta)</p>
                  <p className="text-2xl font-bold text-emerald-500 print:text-emerald-700 print:text-xl">{results.vet} kcal</p>
                  <p className={`text-xs ${textSecondary} print:text-gray-500 mt-1`}>Objetivo calórico</p>
                </div>
                <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-100 print:text-black`}>
                  <p className={`text-sm ${textSecondary} print:text-gray-600 mb-1`}>IMC</p>
                  <p className="text-2xl font-bold print:text-xl print:text-black">{results.imc}</p>
                  <p className={`text-xs ${textSecondary} print:text-gray-500 mt-1`}>
                    {parseFloat(results.imc) < 18.5 ? 'Abaixo' : parseFloat(results.imc) < 25 ? 'Normal' : parseFloat(results.imc) < 30 ? 'Sobrepeso' : 'Obesidade'}
                  </p>
                </div>
              </div>

              {/* --- 3. Gráficos Visuais de Macros --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 print:mb-4 print:break-inside-avoid">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 print:text-black print:text-base print:mb-2">
                    <PieChart className="w-5 h-5 text-emerald-500" />
                    Macronutrientes Diários
                  </h3>
                  
                  <div className="space-y-6 print:space-y-3">
                    {/* PROTEÍNA */}
                    <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:p-2`}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="font-semibold text-teal-500 flex items-center gap-2 print:text-teal-700">
                            Proteínas
                            <span className="text-xs font-normal text-gray-500 bg-teal-100 dark:bg-teal-900 px-2 py-0.5 rounded-full print:bg-teal-50 print:text-teal-800 print:border print:border-teal-200">
                              {((results.proteinCal/results.vet)*100).toFixed(0)}%
                            </span>
                          </p>
                          <p className={`text-xs ${textSecondary} mt-1`}>{results.proteinPerKg}g/kg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold print:text-lg print:text-black">{results.protein}g</p>
                          <p className="text-xs text-gray-500">{results.proteinCal} kcal</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden print:bg-gray-300">
                        <div 
                          className="bg-teal-500 h-2.5 rounded-full transition-all duration-1000 ease-out print:bg-teal-600 print:print-color-adjust-exact" 
                          style={{ width: `${(results.proteinCal/results.vet)*100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* CARBOIDRATO */}
                    <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:p-2`}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="font-semibold text-sky-500 flex items-center gap-2 print:text-sky-700">
                            Carboidratos
                            <span className="text-xs font-normal text-gray-500 bg-sky-100 dark:bg-sky-900 px-2 py-0.5 rounded-full print:bg-sky-50 print:text-sky-800 print:border print:border-sky-200">
                              {((results.carbCal/results.vet)*100).toFixed(0)}%
                            </span>
                          </p>
                          <p className={`text-xs ${textSecondary} mt-1`}>Restante calórico</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold print:text-lg print:text-black">{results.carbs}g</p>
                          <p className="text-xs text-gray-500">{results.carbCal} kcal</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden print:bg-gray-300">
                        <div 
                          className="bg-sky-500 h-2.5 rounded-full transition-all duration-1000 ease-out print:bg-sky-600 print:print-color-adjust-exact" 
                          style={{ width: `${(results.carbCal/results.vet)*100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* GORDURA */}
                    <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:p-2`}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="font-semibold text-purple-500 flex items-center gap-2 print:text-purple-700">
                            Gorduras
                            <span className="text-xs font-normal text-gray-500 bg-purple-100 dark:bg-purple-900 px-2 py-0.5 rounded-full print:bg-purple-50 print:text-purple-800 print:border print:border-purple-200">
                              {((results.fatCal/results.vet)*100).toFixed(0)}%
                            </span>
                          </p>
                          <p className={`text-xs ${textSecondary} mt-1`}>{results.fatPerKg}g/kg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold print:text-lg print:text-black">{results.fat}g</p>
                          <p className="text-xs text-gray-500">{results.fatCal} kcal</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden print:bg-gray-300">
                        <div 
                          className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out print:bg-purple-600 print:print-color-adjust-exact" 
                          style={{ width: `${(results.fatCal/results.vet)*100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="print:break-inside-avoid">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 print:text-black print:text-base print:mb-2">
                    <Droplet className="w-5 h-5 text-blue-400" />
                    Hidratação
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${inputBg} print:bg-gray-50 print:border print:border-gray-200 print:text-black print:p-3`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">Água Diária</p>
                        <p className="text-2xl font-bold text-blue-400 print:text-blue-600">{(results.waterIntake/1000).toFixed(1)}L</p>
                      </div>
                      <p className={`text-sm ${textSecondary} print:text-gray-600`}>{results.waterIntake}ml/dia (35ml/kg)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Distribution */}
            <div className={`${cardBg} rounded-xl shadow-lg p-6 md:p-8 border ${borderColor} print:shadow-none print:border-none print:p-0 print:break-inside-avoid`}>
              <div className="flex justify-between items-center mb-6 print:mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 print:text-black print:text-lg">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Distribuição por Refeição ({numMeals} refeições)
                </h3>
              </div>

              {/* Grid com animação para quando muda o número de refeições */}
              {currentTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3" ref={mealsRef}>
                {currentTemplate.distribution.map((percent, index) => {
                  const calories = Math.round((results.vet * percent) / 100);
                  const protein = Math.round((results.protein * percent) / 100);
                  const carbs = Math.round((results.carbs * percent) / 100);
                  const fat = Math.round((results.fat * percent) / 100);
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border-t-4 border-emerald-500 ${inputBg} border-b border-r border-l ${borderColor} print:bg-white print:border-gray-300 print:text-black print:break-inside-avoid print:shadow-sm`}>
                      <p className="font-semibold mb-3 text-emerald-500 print:text-emerald-700 print:mb-1">{currentTemplate.labels[index]}</p>
                      <p className={`text-sm ${textSecondary} print:text-gray-800 mb-2 font-medium`}>{calories} kcal ({percent}%)</p>
                      <div className={`text-xs space-y-1 ${textSecondary} print:text-gray-600`}>
                        <p>Proteína: {protein}g</p>
                        <p>Carboidrato: {carbs}g</p>
                        <p>Gordura: {fat}g</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              <div className={`mt-6 p-4 rounded-lg border-2 border-emerald-500 ${inputBg} print:bg-white print:border-emerald-600 print:mt-4 print:break-inside-avoid`}>
                <p className={`text-sm ${textSecondary} print:text-gray-700`}>
                  💡 <strong>Dica Profissional:</strong> Concentre carboidratos no pré (1-2h antes) e pós-treino (até 2h depois). Mantenha proteína equilibrada em todas as refeições para síntese proteica constante.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- DONATION POPUP --- */}
      {/* Container fixo com ref de animação. 
        Removemos 'animate-in' do Tailwind para deixar o AutoAnimate cuidar da entrada 
      */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden mx-4 md:mx-0 flex flex-col items-end" ref={popupParentRef}>
        {showDonationPopup && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-2xl rounded-xl p-5 max-w-sm w-full relative`}>
            
            <button 
              onClick={() => setShowDonationPopup(false)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full mt-1">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current" />
              </div>
              <div>
                <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Gostou da ferramenta?
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Mantemos a calculadora gratuita e sem anúncios intrusivos. Se essa calculadora te ajudou, considere nos apoiar com qualquer valor!
                </p>
                
                <div className="flex gap-2">
                  <a 
                    href="https://pixgg.com/mapyngua" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Coffee className="w-4 h-4" />
                    Apoiar Projeto
                  </a>
                  <button
                    onClick={() => setShowDonationPopup(false)}
                    className={`text-xs px-3 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'} transition-colors`}
                  >
                    Agora não
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Bonito */}
      <footer className={`mt-auto py-8 border-t ${borderColor} ${cardBg} print:hidden`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`text-sm ${textSecondary} mb-2`}>
            Desenvolvido por
          </p>
          <a
            href="https://mapyngua.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
          >
            <Globe className="w-4 h-4" />
            mapyngua.com.br
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className={`text-xs ${textSecondary} mt-4`}>
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}