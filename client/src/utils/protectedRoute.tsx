import React from "react";
import { useUserContext } from "../context/userContext";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="center-div w-full h-screen ">
        <Loader className="animate-spin text-gray-800" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}
