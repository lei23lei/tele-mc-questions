declare module "*.json" {
  const value: Array<{
    name: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  export default value;
}
