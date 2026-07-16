'use client'

import { useGeneratorStore } from '@/store/useGeneratorStore'

export default function StepStory() {
  const { name1, name2, specialDate, duration, favMemory, loveMessage, nextStep, setField } =
    useGeneratorStore()

  return (
    <div>
      <div className="sp-eye" aria-hidden="true">Step 01 — The Story</div>
      <h2 className="sp-title">Your Love Story</h2>
      <p className="sp-desc">
        Every detail makes the experience more personal. Fill what you can — the rest becomes poetry.
      </p>

      {/* Row 1: two-col grid */}
      <div className="fg2">
        <div className="ff">
          <label htmlFor="name1">Your Name</label>
          <input
            id="name1"
            type="text"
            value={name1}
            onChange={(e) => setField('name1', e.target.value)}
            placeholder="e.g. Sofia"
            autoComplete="given-name"
            maxLength={60}
          />
        </div>
        <div className="ff">
          <label htmlFor="name2">Their Name</label>
          <input
            id="name2"
            type="text"
            value={name2}
            onChange={(e) => setField('name2', e.target.value)}
            placeholder="e.g. Aryan"
            autoComplete="off"
            maxLength={60}
          />
        </div>
        <div className="ff">
          <label htmlFor="special-date">Anniversary / Special Date</label>
          <input
            id="special-date"
            type="date"
            value={specialDate}
            onChange={(e) => setField('specialDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="ff">
          <label htmlFor="duration">How Long Together</label>
          <input
            id="duration"
            type="text"
            value={duration}
            onChange={(e) => setField('duration', e.target.value)}
            placeholder="e.g. 3 years, 47 days…"
            autoComplete="off"
            maxLength={80}
          />
        </div>
      </div>

      {/* Favourite memory */}
      <div className="ff" style={{ marginBottom: '1rem' }}>
        <label htmlFor="fav-memory">A Favourite Memory Together</label>
        <input
          id="fav-memory"
          type="text"
          value={favMemory}
          onChange={(e) => setField('favMemory', e.target.value)}
          placeholder="The night we got lost in Lisbon and found each other…"
          autoComplete="off"
          maxLength={200}
        />
      </div>

      {/* Love message */}
      <div className="ff">
        <label htmlFor="love-message">Your Love Message</label>
        <textarea
          id="love-message"
          value={loveMessage}
          onChange={(e) => setField('loveMessage', e.target.value)}
          placeholder="Write from the heart. Raw, honest, real — this is the emotional centrepiece of your entire website."
          rows={5}
          maxLength={2000}
          aria-describedby="love-message-hint"
        />
        <span
          id="love-message-hint"
          style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.2rem' }}
          aria-live="polite"
        >
          {loveMessage.length > 0 ? `${loveMessage.length} / 2000 characters` : 'Everything stays local — never sent to any server.'}
        </span>
      </div>

      <div className="btn-row">
        <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.22)' }}>
          🔒 Everything stays local — private &amp; secure.
        </span>
        <button className="btn btn-primary" onClick={nextStep} aria-label="Continue to photo upload step">
          Continue &nbsp;→
        </button>
      </div>
    </div>
  )
}
