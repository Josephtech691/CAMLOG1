function ImageUploader({ images, setImages }) {

  const handleSelectImages = (e) => {
    const fichiers = Array.from(e.target.files);

    // Limite à 5 images au total
    const places = 5 - images.length;
    if (places <= 0) return;

    const nouveaux = fichiers.slice(0, places);
    setImages([...images, ...nouveaux]);

    // Réinitialise l'input pour permettre de resélectionner les mêmes fichiers
    e.target.value = '';
  };

  const handleRetirer = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Photos ({images.length}/5)
      </label>

      {/* Input fichier — visible seulement si moins de 5 images */}
      {images.length < 5 && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectImages}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 cursor-pointer"
        />
      )}

      {/* Prévisualisations */}
      <div className="flex flex-wrap gap-3 mt-3">
        {images.map((fichier, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(fichier)}
              alt={`preview-${index}`}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            {/* Bouton retirer */}
            <button
              type="button"
              onClick={() => handleRetirer(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {images.length === 5 && (
        <p className="text-sm text-gray-400 mt-2">Limite de 5 photos atteinte.</p>
      )}
    </div>
  );
}

export default ImageUploader;
