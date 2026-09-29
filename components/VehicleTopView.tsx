'use client'

import type { Vehicle } from '@/lib/types'
import { getVehicleLayout, VEHICLE_LAYOUT_LABELS } from '@/lib/vehicle-layout'

function TireSlot({ label }: { label: string }) {
  return (
    <div
      title={label}
      style={{
        width: '26px',
        height: '54px',
        borderRadius: '8px',
        border: '2px solid var(--text-secondary)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.58rem',
        fontWeight: 800,
        color: 'var(--text-muted)',
      }}
    >
      {label}
    </div>
  )
}

export default function VehicleTopView({ vehicle }: { vehicle: Vehicle }) {
  const layout = getVehicleLayout(vehicle)
  const isTrailer = layout.type === 'semi_trailer' || layout.type === 'trailer'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <div>
          <strong>{VEHICLE_LAYOUT_LABELS[layout.type]}</strong>
          <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {layout.axleCount} {layout.axleCount === 1 ? 'eixo' : 'eixos'}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          Vista superior • slots ainda sem montagem interativa
        </span>
      </div>

      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '1rem 1.5rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            width: isTrailer ? '68%' : '46%',
            height: isTrailer ? '76px' : '92px',
            margin: '0 auto 1.25rem',
            borderRadius: isTrailer ? '10px' : '22px 22px 10px 10px',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {isTrailer ? 'Estrutura' : 'Cabine / estrutura'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {layout.axles.map(axle => {
            const left = axle.slots.filter(slot => slot.side === 'left')
            const right = axle.slots.filter(slot => slot.side === 'right')

            return (
              <div key={axle.axle}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr minmax(90px, 1.4fr) 1fr',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                    {left.map(slot => <TireSlot key={slot.id} label={slot.id} />)}
                  </div>

                  <div style={{ position: 'relative', height: '12px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '5px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--text-muted)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translate(-50%, -55%)',
                        top: 0,
                        background: 'var(--bg-primary)',
                        padding: '0 0.4rem',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                      }}
                    >
                      E{axle.axle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '5px' }}>
                    {right.map(slot => <TireSlot key={slot.id} label={slot.id} />)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        Cada posição já possui um identificador estável. No próximo estágio esses slots poderão receber o pneu montado,
        seu histórico e a indicação de tratamento Flat Free.
      </p>
    </div>
  )
}
