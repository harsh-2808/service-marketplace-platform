interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function ServiceCard({
  title,
  description,
  price,
  buttonLabel = "Book Now",
  onButtonClick,
}: ServiceCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition">
      <h4 className="font-semibold text-blue-700">{title}</h4>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
      <p className="text-gray-800 mt-2">₹{price}</p>
      <button
        onClick={onButtonClick}
        className="mt-3 bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
