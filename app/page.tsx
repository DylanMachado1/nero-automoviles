import { HomeContent } from '@/components/sections/home-content';
import { FeaturedVehicles } from '@/components/sections/featured-vehicles';

export default function Home() {
  return <HomeContent featured={<FeaturedVehicles />} />;
}
