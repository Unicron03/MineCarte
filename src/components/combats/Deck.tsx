'use client';

const Deck = ({ count = 0, opponent = false }) => {
  return (
    <div style={{ position: 'relative', height: '200px', width: '300px' }}>
      {Array.from({ length: count }).map((_, index, arr) => {
        const total = arr.length;
        const baseAngle = (index - (total - 1) / 2) * 6;
        const angle = opponent ? -baseAngle : baseAngle; // Inversion pour l'adversaire
        const offset = index * 20;
        const origin = opponent ? 'top center' : 'bottom center';

        return (
          <img
            key={index}
            src="/card/back-card.png"
            alt="Carte face cachée"
            style={{
              position: 'absolute',
              left: `${offset}px`,
              top: '0',
              width: '120px',
              height: '180px',
              transform: `rotate(${angle}deg)`,
              transformOrigin: origin,
              zIndex: index,
            }}
          />
        );
      })}
    </div>
  );
};

export default Deck;
