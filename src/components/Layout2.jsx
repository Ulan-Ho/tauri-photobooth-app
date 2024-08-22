import '../App.css';

export default function Layouts({ children }) {
    return (
        <div className="flex justify-center items-center scale-0.5">
            <div className="container2 select-none">
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    {/* <Link className="fixed left-24 top-20" to='/'>Назад</Link> */}
                    {children}
                </div>
            </div>
        </div>
    )
}