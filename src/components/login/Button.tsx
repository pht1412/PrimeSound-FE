type Props = {
  text: string;
  type?: "button" | "submit";
};

export default function Button({ text, type = "button" }: Props) {
  return (
    <button
      type={type}
      className="w-full py-3 bg-green-500 rounded-full font-semibold hover:bg-green-600 transition"
    >
      {text}
    </button>
  );
}