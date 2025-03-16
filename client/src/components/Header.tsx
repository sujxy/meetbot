import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 text-center">
      <h1 className="text-2xl font-bold">MeetBot</h1>
      <p className="text-sm">Your Meeting Summary Assistant</p>
    </header>
  );
};

export default Header;
