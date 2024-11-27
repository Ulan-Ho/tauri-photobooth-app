import { Layout, ArrowLeft, Brush, Fingerprint, Clock, Printer } from "lucide-react";
import { Link } from 'react-router-dom';

export default function AdminHeaders({ pageName, typePage }) {

    return(
        <header className='flex justify-between items-center mb-8'>
            <div className='flex items-center'>
                <Link to='/settings' className='mr-4'>
                    <ArrowLeft className='w-6 h-6' />
                </Link>
                <h1 className='text-4xl font-bold'>{pageName}</h1>
            </div>
            { typePage === 'printer' && <Printer className="w-12 h-12 text-blue-600 dark:text-blue-400" /> }
            { typePage === 'clock' && <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" /> }
            { typePage === 'touch' && <Fingerprint className="w-12 h-12 text-blue-600 dark:text-blue-400" /> }
            { typePage === 'template' && <Layout className='w-12 h-12 text-blue-600 dark:text-blue-400' /> }
            { typePage === 'editor' && <Brush className="w-12 h-12 text-blue-600 dark:text-blue-400" /> }
            { typePage === 'chromakey' && <Brush className="w-12 h-12 text-blue-600 dark:text-blue-400" /> }

        </header>
    );
}