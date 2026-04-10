 
 
 
 function APropos(){
 return(
    <div>
 {/* Comment ça marche */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icone: '', titre: 'Créez votre compte',    desc: 'Inscription rapide et gratuite en quelques secondes.' },
              { icone: '', titre: 'Publiez votre annonce', desc: 'Ajoutez vos photos, le prix et les détails du bien.' },
              { icone: '', titre: 'Trouvez un acheteur',   desc: 'Soyez contacté directement par des acheteurs sérieux.' },
            ].map((etape, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="text-5xl">{etape.icone}</div>
                <h3 className="text-lg font-semibold text-gray-800">{etape.titre}</h3>
                <p className="text-gray-500 text-sm">{etape.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
 )
 }