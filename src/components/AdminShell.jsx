import AdminHeaders from "./AdminHeaders";

export default function AdminShell({ children, props }) {
    return (
        <div className='min-h-screen flex justify-center items-start bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
            <div className='rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300' style={{  maxWidth: '1200px', minWidth: '1000px', height: props.type === 'template' ? '100%' : '830px', minHeight: '830px' }}>
                <main className="p-8">
                    <AdminHeaders pageName={props.page} typePage={props.type} />
                    { children }
                </main>
            </div>
        </div>
    )
}