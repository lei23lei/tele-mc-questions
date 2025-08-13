"use client";

import { useState, useEffect } from "react";
import questionsData from "../../questions.json";

interface Question {
  name: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizApp() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answerHistory, setAnswerHistory] = useState<{ [key: string]: string }>(
    {}
  );

  // Get a random question that hasn't been used yet
  const getRandomQuestion = () => {
    const availableQuestions = questionsData.filter(
      (q: Question) => !usedQuestions.has(q.name)
    );

    if (availableQuestions.length === 0) {
      // Reset if all questions have been used
      setUsedQuestions(new Set());
      return questionsData[Math.floor(Math.random() * questionsData.length)];
    }

    return availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ];
  };

  // Load a new question
  const loadNewQuestion = () => {
    const question = getRandomQuestion();
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setUsedQuestions((prev) => new Set([...prev, question.name]));

    // Add to history
    setQuestionHistory((prev) => [...prev, question]);
    setCurrentIndex((prev) => prev + 1);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.correctAnswer;

    if (correct) {
      setScore((prev) => prev + 1);
    }

    setTotalAnswered((prev) => prev + 1);
    setShowExplanation(true);

    // Save answer to history
    if (currentQuestion) {
      setAnswerHistory((prev) => ({
        ...prev,
        [currentQuestion.name]: answer,
      }));
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Handle previous question navigation (always available if there are previous questions)
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        handlePreviousQuestion();
        return;
      }

      if (selectedAnswer !== null) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNextQuestion();
        }
      } else {
        const keyMap: { [key: string]: number } = {
          "1": 0,
          a: 0,
          A: 0,
          "2": 1,
          b: 1,
          B: 1,
          "3": 2,
          c: 2,
          C: 2,
          "4": 3,
          d: 3,
          D: 3,
        };

        if (keyMap[event.key] !== undefined && currentQuestion) {
          event.preventDefault();
          handleAnswerSelect(currentQuestion.options[keyMap[event.key]]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedAnswer, currentQuestion, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle next question
  const handleNextQuestion = () => {
    loadNewQuestion();
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      const previousQuestion = questionHistory[currentIndex - 1];
      setCurrentQuestion(previousQuestion);
      setCurrentIndex((prev) => prev - 1);

      // Restore previous answer if it exists
      const previousAnswer = answerHistory[previousQuestion.name];
      setSelectedAnswer(previousAnswer || null);
      setShowExplanation(previousAnswer !== undefined);
    }
  };

  // Handle restart quiz
  const handleRestartQuiz = () => {
    setScore(0);
    setTotalAnswered(0);
    setUsedQuestions(new Set());
    setQuestionHistory([]);
    setCurrentIndex(-1);
    setAnswerHistory({});
    loadNewQuestion();
  };

  // Load initial question
  useEffect(() => {
    loadNewQuestion();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">
            Loading question...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-3 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Networking Quiz
            </h1>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 text-center">
              <div className="bg-blue-100 rounded-lg px-3 py-2 sm:px-4">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">
                  Score
                </p>
                <p className="text-lg sm:text-xl font-bold text-blue-800">
                  {score}/{totalAnswered}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg px-3 py-2 sm:px-4">
                <p className="text-xs sm:text-sm text-green-600 font-medium">
                  Accuracy
                </p>
                <p className="text-lg sm:text-xl font-bold text-green-800">
                  {totalAnswered > 0
                    ? Math.round((score / totalAnswered) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <button
              onClick={handleRestartQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Restart Quiz
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                Question {totalAnswered + 1}
                {currentIndex > 0 && (
                  <span className="ml-2 text-blue-600">
                    (← {currentIndex} previous questions available)
                  </span>
                )}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {usedQuestions.size} of {questionsData.length} used
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>
          {/* Answer Options */}

          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;
              let optionStyle =
                "border-gray-200 text-black hover:border-blue-300 hover:bg-blue-50";

              if (selectedAnswer !== null) {
                if (isCorrectAnswer) {
                  optionStyle = "border-green-500 bg-green-50 text-green-800";
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = "border-red-500 bg-red-50 text-red-800";
                }
              } else if (isSelected) {
                optionStyle = "border-blue-500 bg-blue-50 text-blue-800";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 font-medium min-h-[44px] sm:min-h-[52px] ${optionStyle} ${
                    selectedAnswer === null
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-current flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base flex-1">
                      {option}
                    </span>
                    {selectedAnswer !== null && isCorrectAnswer && (
                      <span className="ml-2 text-green-600 text-lg sm:text-xl">
                        ✓
                      </span>
                    )}
                    {isSelected && !isCorrectAnswer && (
                      <span className="ml-2 text-red-600 text-lg sm:text-xl">
                        ✗
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Result Message
          {showExplanation && (
            <div
              className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start">
                <span
                  className={`text-xl sm:text-2xl mr-2 sm:mr-3 mt-0.5 flex-shrink-0 ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm sm:text-base ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </p>
                  <p
                    className={`text-xs sm:text-sm ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCorrect
                      ? "Great job! You got it right."
                      : `The correct answer is: ${currentQuestion.correctAnswer}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                    Press Enter/Space for next question
                  </p>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Navigation Buttons */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="flex flex-row gap-3 justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentIndex <= 0}
              className={`font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base w-full sm:w-auto ${
                currentIndex <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-gray-700 text-white hover:shadow-xl"
              }`}
            >
              ← Previous
            </button>
            {showExplanation && (
              <button
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 sm:mt-8 bg-white rounded-lg shadow-lg p-3 sm:p-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {usedQuestions.size} / {questionsData.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(usedQuestions.size / questionsData.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
