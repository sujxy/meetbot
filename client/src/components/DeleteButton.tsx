import { useState } from "react";

import { LoaderCircle, Trash } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  deleteHandler?: () => Promise<void>;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ deleteHandler }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // if (!confirm("Are you sure you want to delete?")) return;
    setLoading(true);
    try {
      await deleteHandler?.();
    } catch (error) {
      toast.error("Delete error");
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
