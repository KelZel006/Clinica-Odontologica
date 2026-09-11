'use client'
import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Paciente = { id: string; nombre?: string; apellido?: string; telefono?: string }

export function PacienteCombobox({
  pacientes,
  value,
  onChange,
  placeholder = 'Buscar paciente por nombre...',
  allowClear = false,
  clearLabel = 'Todos los pacientes',
}: {
  pacientes: Paciente[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  allowClear?: boolean
  clearLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = (pacientes ?? []).find(p => p.id === value)
  const label = selected ? `${selected.nombre ?? ''} ${selected.apellido ?? ''}`.trim() : (allowClear ? clearLabel : 'Seleccionar')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open}
          className="w-full justify-between font-normal">
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem value="__todos__" onSelect={() => { onChange(''); setOpen(false) }}>
                  <Check className={cn('mr-2 h-4 w-4', value === '' ? 'opacity-100' : 'opacity-0')} />
                  {clearLabel}
                </CommandItem>
              )}
              {(pacientes ?? []).map(p => {
                const nombre = `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim()
                return (
                  <CommandItem key={p.id} value={`${nombre} ${p.telefono ?? ''}`} onSelect={() => { onChange(p.id); setOpen(false) }}>
                    <Check className={cn('mr-2 h-4 w-4', value === p.id ? 'opacity-100' : 'opacity-0')} />
                    <span className="flex flex-col">
                      <span>{nombre}</span>
                      {p.telefono && <span className="text-xs text-muted-foreground">{p.telefono}</span>}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
