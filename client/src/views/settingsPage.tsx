import axios from "axios";
import { Loader, LogOut, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SettingsPage: React.FC = () => {
  const [selection, setSelection] = useState<string>("");
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPreference, setCurrentPreference] = useState<string>(
    "llama-3.3-70b-versatile"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data } = await axios.get("/user/preferences");
        if (data.success) {
          setCurrentPreference(data.data);
          setSelection(data.data);
        }
      } catch (err) {
        toast.error("Failed to fetch preferences");
      }
    };
    fetchPreferences();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/signin");
    toast.success("Logged out successfully!");
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection(e.target.value);
    setIsChanged(e.target.value !== currentPreference);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/user/preferences", {
        modelPreference: selection,
      });
      if (data.success) {
        setCurrentPreference(selection);
        toast.success("Settings changed !");
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error("error saving changes!");
    } finally {
      setIsChanged(false);
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 2xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">Settings</h1>
          <p className="text-md text-gray-400">Manage your preferences.</p>
        </span>
      </div>
      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-2 ">
        <span className="">
          <h2 className="font-semibold my-2">Preferences</h2>
          <label className="ms-4 text-md font-light text-gray-700">
            Summarization Model:
            <select
              className="ml-2 text-sm font-semibold text-gray-700 p-2 rounded-md border border-gray-200"
              value={selection}
              onChange={handleSelectChange}
            >
              <option value="meta-llama/llama-4-scout-17b-16e-instruct">
                meta-llama/llama-4-scout-17b-16e-instruct
              </option>
              <option value="llama-3.3-70b-versatile">
                llama-3.3-70b-versatile
              </option>
              <option value="gemma2-9b-it">gemma2-9b-it</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
            </select>
          </label>
        </span>
        <span className="">
          <h2 className="font-semibold my-2">Account</h2>
          <label className="ms-4 text-md font-light text-gray-700">
            Logout of existing account ?
            <button
              onClick={handleLogout}
              className="bg-red-500/80 ms-4 text-sm font-semibold text-gray-50 inline-flex justify-center items-center gap-2 p-2 rounded-md hover:bg-red-500"
            >
              <LogOut size={20} />
              <p>Logout</p>
            </button>
          </label>
        </span>
        {isChanged && (
          <span className="w-full flex items-center justify-end py-2 ">
            <button
              onClick={handleSaveChanges}
              className="filled-btn center-div gap-2"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <p>Save changes</p>
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
