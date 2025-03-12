import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps)=> {
  return (
    <div className="app-container">
      <main className="main-content">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
export default AppLayout