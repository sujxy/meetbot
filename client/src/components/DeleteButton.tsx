import { useState } from "react";
import axios from "axios";
import { LoaderCircle, Trash } from "lucide-react";

interface DeleteButtonProps {
  route: string;
  onDeleteSuccess?: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  route,
  onDeleteSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete?")) return;

    setLoading(true);
    try {
      await axios.post(route);
      alert("Deleted successfully!");
      onDeleteSuccess?.(); // Call callback if provided
    } catch (error) {
      alert("Error deleting item!");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500/80 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-red-500 "
    >
      {loading ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <Trash size={18} />
      )}
      <span className="">Delete Session</span>
    </button>
  );
};

export default DeleteButton;
