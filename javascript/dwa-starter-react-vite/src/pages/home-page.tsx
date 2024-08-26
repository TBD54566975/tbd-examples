import workplaceImage from "../assets/workplace.svg";

import { Web5Connection } from "@/web5/Web5Connection";
import { useWeb5 } from "@/web5";
import { Typography } from "@/components/ui/typography";
import { TodoList } from "@/components/todo-list";

/**
 * Home page: landing page with invitation to connect
 */
export const HomePage = () => {
  const { isConnected } = useWeb5();

  return (
    <div className="w-full">
      {isConnected ? (
        <TodoList />
      ) : (
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold">DWA Starter</h1>
          <div className="flex justify-center">
            <img src={workplaceImage} className="max-h-72 mx-auto" alt="DWA" />
          </div>
          <Web5Connection />
          <Typography variant="p">Connect your DWA to get started</Typography>
        </div>
      )}
    </div>
  );
};
