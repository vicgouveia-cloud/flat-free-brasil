'use client'

import type { Tire, Vehicle } from '@/lib/types'
import { getVehicleLayout, VEHICLE_LAYOUT_LABELS } from '@/lib/vehicle-layout'

export interface VehicleMountedTire {
  slotId: string
  tire: Tire
  hasFlatFree: boolean
}

function TireSlot({
  label,
  mounted,
  selected,
  onSelect,
}: {
  label: string
  mounted?: VehicleMountedTire
  selected?: boolean
  onSelect?: () => void
}) {
  const title = mounted
    ? `${label} • ${mounted.tire.identificacaoInterna} • ${mounted.hasFlatFree ? 'Com Flat Free na data exibida' : 'Sem aplicação Flat Free na data exibida'}`
    : `${label} • posição livre`

  const content = (
    <div
      title={title}
      style={{
        width: mounted ? '44px' : '30px',
        minHeight: '58px',
        padding: '0.25rem 0.15rem',
        borderRadius: '8px',
        border: selected
          ? '2px solid var(--color-safety-orange)'
          : mounted
          ? mounted.hasFlatFree
            ? '2px solid var(--color-safety-orange)'
            : '2px solid var(--text-secondary)'
          : '2px dashed var(--border-color)',
        background: mounted
          ? mounted.hasFlatFree
            ? 'rgba(255,92,0,0.10)'
            : 'var(--bg-surface)'
          : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.1rem',
        fontSize: '0.55rem',
        fontWeight: 800,
        color: mounted?.hasFlatFree ? 'var(--color-safety-orange)' : 'var(--text-muted)',
        textAlign: 'center',
      }}
    >
      <span>{mounted ? mounted.tire.identificacaoInterna : label}</span>
      {mounted && (
        <span style={{ fontSize: '0.48rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  )

  if (mounted || !onSelect) return content

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Selecionar posição ${label}`}
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
    >
      {content}
    </button>
  )
}

export default function VehicleTopView({
  vehicle,
  mountedTires = [],
  selectedSlotId,
  onSelectFreeSlot,
  referenceDate,
}: {
  vehicle: Vehicle
  mountedTires?: VehicleMountedTire[]
  selectedSlotId?: string | null
  onSelectFreeSlot?: (slotId: string) => void
  referenceDate?: string
}) {
  const layout = getVehicleLayout(vehicle)
  const isTrailer = layout.type === 'semi_trailer' || layout.type === 'trailer'
  const mountedBySlot = new Map(mountedTires.map(item => [item.slotId, item]))

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
          Vista superior • montagem em {referenceDate || 'hoje'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid var(--color-safety-orange)', background: 'rgba(255,92,0,0.10)' }} />
          Com Flat Free na data exibida
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid var(--text-secondary)', background: 'var(--bg-surface)' }} />
          Sem aplicação na data exibida
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px dashed var(--border-color)' }} />
          Posição livre
        </span>
      </div>

      <div
        style={{
          maxWidth: '560px',
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
                    {left.map(slot => (
                      <TireSlot
                        key={slot.id}
                        label={slot.id}
                        mounted={mountedBySlot.get(slot.id)}
                        selected={selectedSlotId === slot.id}
                        onSelect={mountedBySlot.has(slot.id) ? undefined : () => onSelectFreeSlot?.(slot.id)}
                      />
                    ))}
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
                    {right.map(slot => (
                      <TireSlot
                        key={slot.id}
                        label={slot.id}
                        mounted={mountedBySlot.get(slot.id)}
                        selected={selectedSlotId === slot.id}
                        onSelect={mountedBySlot.has(slot.id) ? undefined : () => onSelectFreeSlot?.(slot.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        A montagem é derivada do histórico de posições. Clique em uma posição livre para montar ou remanejar um pneu. O destaque Flat Free considera somente a aplicação válida no ciclo do pneu na data exibida.
      </p>
    </div>
  )
}
