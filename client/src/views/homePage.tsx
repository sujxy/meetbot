const HomePage: React.FC = () => {
  const currentHour = new Date().getHours();
  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-6 2xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">{greeting}, Sujay!</h1>
          <p className="text-md text-gray-400">
            Here's whats happening with your meetings
          </p>
        </span>
      </div>
    </div>
  );
};

export default HomePage;
