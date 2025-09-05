import MyFont from "./MyFont";

function PageNotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-blue-200 text-center px-6">

            <MyFont
                style={{
                    fontSize: '5rem',
                    color: '#2563EB',        
                    fontWeight: '800',
                    textShadow: '2px 2px 8px rgba(37, 99, 235, 0.5)',
                }}
            >
                <h1>ERRORE 404</h1>
            </MyFont>

            <MyFont
                style={{
                    fontSize: '2.5rem',
                    color: '#1E40AF',        
                    fontWeight: '700',
                    marginTop: '1rem',
                }}
            >
                <p>Pagina Non Trovata</p>
            </MyFont>

            <MyFont
                style={{
                    fontSize: '1.55rem',
                    color: '#111827',        
                    maxWidth: '36rem',
                    marginTop: '0.75rem',
                    lineHeight: 1.5,
                }}
            >
                <p style={{ marginBottom: 0 }}>Oops, la pagina che stavi cercando non esiste</p>
            </MyFont>

            <MyFont
                style={{
                    marginTop: '2.5rem',
                    display: 'inline-block',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden',
                }}
            >
                <img
                    src="images/ice404.png"
                    alt="Page Not Found"
                    style={{ width: '35rem', height: 'auto', display: 'block', borderRadius: '0.75rem', border: '2px solid #93c5fd' }}
                />
            </MyFont>

        </div>
    );
}

export default PageNotFound;
