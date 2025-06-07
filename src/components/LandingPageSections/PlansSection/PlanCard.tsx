import { FaCircleCheck } from 'react-icons/fa6';

interface PlanCardProps {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  buttonLabel: string;
  onClick: () => void;
}

const PlanCard = ({ title, subtitle, price, features, buttonLabel, onClick }: PlanCardProps) => {
  return (
    <div className="bg-white p-[24px] gap-[30px] rounded-[8px] flex flex-col  border border-[#E9ECEF] h-[440px] w-[340px]">
      <div className="flex flex-col gap-[10px]">
        <h3 className="text-[#1D79FB] font-[600] text-[22px] leading-[100%]">{title}</h3>
        <p className="text-[#6B7280] text-[16px] leading-[22px]">{subtitle}</p>
      </div>
      <div className="flex items-end gap-[8px] justify-center">
        <span className="text-[#1D79FB] text-[50px] leading-[42px] font-[900]">{price}</span>
        <span className="text-[20px] leading-[24px] text-[#6B7280]">/mês</span>
      </div>
      <ul className="flex flex-col gap-[10px] mt-[10px]">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-[6px]">
            <FaCircleCheck color="#26B99A" className="text-[15px]" />
            <span className="text-[16px] leading-[100%] text-[#6B7280]">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex-grow flex items-end">
        <button
          onClick={onClick}
          className="mt-[4px] bg-[#1D79FB] text-white font-medium rounded-lg border border-[#01013D] transition-colors duration-300 hover:border-[#01013D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:bg-[#1451C9] active:bg-[#0F3A9B] text-[16px] leading-[100%] py-[14px] px-[10px] flex items-center justify-center w-full"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
