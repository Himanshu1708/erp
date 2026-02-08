import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

const Home = () => {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <EcommerceMetrics />
            </div>
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <MonthlySalesChart />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <MonthlyTarget />
            </div>
          </div>

          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <StatisticsChart />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <DemographicCard />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-7">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
              <RecentOrders />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;