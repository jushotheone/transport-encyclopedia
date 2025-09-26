// app/vehicles/[slug]/page.js
import { fetchVehicles } from "@/lib/sheets";
import Image from "next/image";

function extractYouTubeID(url) {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/);
  return match ? match[1] : null;
}
export default async function VehiclePage(props) {
  const { slug } = await props.params;
  const vehicles = await fetchVehicles();
  const vehicle = vehicles.find((v) => v.slug === slug);

  if (!vehicle) return <div className="p-6">Vehicle not found.</div>;

  const youtubeId = extractYouTubeID(vehicle.video_url);
  const imageUrls = [vehicle.image, ...(vehicle.more_images || [])].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 🖼️ Big Image or Slideshow */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🖼️ Big Image</h2>
        {imageUrls.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imageUrls.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${vehicle.name} image ${i + 1}`}
                className="w-full h-60 object-cover rounded shadow"
              />
            ))}
          </div>
        ) : (
          <div className="h-60 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
            No image added yet. Zion will upload one soon!
          </div>
        )}
      </section>

      {/* 📖 Name & Category */}
      <section>
        <h1 className="text-3xl font-bold">
          📖 {vehicle.name}{" "}
          <span className="text-base text-purple-700 font-medium">– {vehicle.system} Transport</span>
        </h1>
      </section>

      {/* 📹 Embedded YouTube Video */}
      {youtubeId && (
        <section>
          <h2 className="text-xl font-semibold mb-2">📹 Watch it in Action</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-72 rounded shadow"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Vehicle video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* 🗣️ Zion’s Description */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🗣️ Zion Explains</h2>
        {vehicle.description ? (
          <blockquote className="p-4 border-l-4 border-purple-600 bg-purple-50 text-purple-900 rounded">
            “{vehicle.description}”
            {vehicle.zions_note && (
              <p className="mt-2 italic text-sm">Zion says: {vehicle.zions_note}</p>
            )}
          </blockquote>
        ) : (
          <p className="text-gray-500">Zion hasn’t written the description yet. Stay tuned!</p>
        )}
      </section>

      {/* 🎉 Fun Fact! */}
      {vehicle.funFact && (
        <section>
          <h2 className="text-xl font-semibold mb-2">🎉 Fun Fact!</h2>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded text-yellow-900 shadow">
            {vehicle.funFact}
          </div>
        </section>
      )}

      {/* 🏭 Manufacturers */}
      {Array.isArray(vehicle.manufacturers) && vehicle.manufacturers.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">🏭 Who Builds It?</h2>
          <ul className="list-disc ml-6 space-y-1 text-gray-800">
            {vehicle.manufacturers.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 📍 Origin Country */}
      {vehicle.origin_country && (
        <section>
          <h2 className="text-xl font-semibold mb-2">📍 Origin Country</h2>
          <p>
            <span className="text-2xl mr-2">
              {vehicle.flag_emoji || "🌍"}
            </span>
            {vehicle.origin_country}
          </p>
        </section>
      )}

      {/* 🧠 Bonus Fact */}
      {vehicle.bonus_fact && (
        <section>
          <h2 className="text-xl font-semibold mb-2">🧠 Did You Know?</h2>
          <div className="bg-blue-100 border-l-4 border-blue-400 p-4 rounded text-blue-900 shadow">
            {vehicle.bonus_fact}
          </div>
        </section>
      )}

      {/* 📚 Want to Learn More */}
      {vehicle.learn_more && (
        <section>
          <h2 className="text-xl font-semibold mb-2">📚 Want to Learn More?</h2>
          <ul className="list-disc ml-6 text-blue-700 underline">
            {vehicle.learn_more.split(",").map((link, i) => (
              <li key={i}>
                <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                  {link.trim()}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 🚀 Coming Soon */}
      <section>
        <h2 className="text-2xl font-bold text-purple-600 mt-12">🚀 Coming Soon — Powered by Zion!</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700 bg-white rounded p-4 border">
          <li>🎮 <strong>Quiz Mode</strong> – Answer fun questions to test what you’ve learned!</li>
          <li>💬 <strong>Zion Recommends…</strong> – Zion’s personal picks and favourites!</li>
          <li>🧩 <strong>Build-Your-Own Transport</strong> – Mix parts and design your dream machine!</li>
          <li>🔤 <strong>Text-to-Speech</strong> – Hear the page read out loud for easy learning.</li>
        </ul>
      </section>
    </div>
  );
}