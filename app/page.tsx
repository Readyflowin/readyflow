import HeroSection from '../components/HeroSection';
import ToolsSection from '../components/ToolsSection';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      
      {/* 1. Hero Section (Introduction) */}
      <HeroSection />
      
      {/* 2. Tools Grid (The Product) */}
      <ToolsSection />
      
      {/* 3. Reviews (Social Proof) */}
      <Testimonials />
      
    </main>
  );
}