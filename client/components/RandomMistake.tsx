import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

const mistakes = [
  {
    title: "Confusions with powers and negatives",
    content: "Remember that x² is always positive and -x² is always negative. Also, do not confuse (-x)² and -x².",
  },
  {
    title: "Thinking that (a + b)² = a² + b²",
    content: "In reality, (a + b)² = a² + 2ab + b². Similarly, √a² + 25 ≠ a + 5.",
  },
  {
    title: "Forgetting to take the negative square root",
    content: "√9 has two answers: -3 and 3. Always consider both roots when solving equations like x² = 4 (x = 2 or x = -2).",
  },
  {
    title: "Thinking that 1/(x+y) = 1/x + 1/y",
    content: "This is incorrect. Use partial fractions for expressions like 1/(x+y). You can only split the numerator: (a+b)/(x+y) = a/(x+y) + b/(x+y).",
  },
  {
    title: "Forgetting units and accuracy",
    content: "Always check the required degree of accuracy (SF/DP) and include units (cm², kg, etc.) as specified in the question.",
  },
  {
    title: "Forgetting the constant of integration (+c)",
    content: "Always write +c after answering indefinite integral questions. Example: ∫(1/x)dx = ln|x| + c.",
  },
  {
    title: "Integrating/Differentiating eˣ",
    content: "The derivative of eᵃˣ is aeᵃˣ, and the integral is (1/a)eᵃˣ + c. Don't use power rules for eˣ!",
  },
  {
    title: "Mixing up radians and degrees",
    content: "Check your calculator mode! Be consistent throughout the question and use radians for arc length/sector area formulas.",
  },
  {
    title: "Thinking that cosec x = 1/cos x",
    content: "Remember the 3rd letter rule: cosec (s) = 1/sin, sec (c) = 1/cos, cot (t) = 1/tan.",
  },
  {
    title: "The d²y/dx² = 0 inflection trap",
    content: "If d²y/dx² = 0, it could be a max, min, or point of inflection. Test values on either side to be sure.",
  },
];

export function RandomMistake() {
  const [mistake, setMistake] = useState(mistakes[0]);

  const rotateMistake = () => {
    const randomIndex = Math.floor(Math.random() * mistakes.length);
    setMistake(mistakes[randomIndex]);
  };

  useEffect(() => {
    rotateMistake();
    const interval = setInterval(rotateMistake, 30000); // Rotate every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wider">
              Common Exam Pitfall
            </h4>
            <button 
              onClick={rotateMistake}
              className="text-amber-500 hover:text-amber-700 transition-colors"
              title="Next mistake"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <h5 className="font-semibold text-slate-900 mb-1">{mistake.title}</h5>
          <p className="text-sm text-slate-700 leading-relaxed">
            {mistake.content}
          </p>
        </div>
      </div>
    </Card>
  );
}
