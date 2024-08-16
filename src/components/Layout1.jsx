import '../App.css';

export default function Layouts({ children }) {
    return (
        <div className="flex justify-center items-center">
            <div className="select-none container1">
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    {children}
                </div>
            </div>
        </div>
    )
}