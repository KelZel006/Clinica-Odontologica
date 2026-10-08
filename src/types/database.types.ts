
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "abonos": {
                  Row: {
                    "anulado": boolean,"anulado_at": string | null,"anulado_por": string | null,"cita_id": string | null,"concepto": string,"created_at": string,"cuota_id": string | null,"id": string,"metodo": Database["public"]['Enums']["metodo_pago"],"monto": number,"motivo_anulacion": string | null,"notas": string | null,"paciente_id": string,"pagado_at": string,"plan_tratamiento_id": string | null,"recibido_por": string | null,"recibo_numero": number,"referencia": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "anulado"?: boolean,"anulado_at"?: string | null,"anulado_por"?: string | null,"cita_id"?: string | null,"concepto"?: string,"created_at"?: string,"cuota_id"?: string | null,"id"?: string,"metodo": Database["public"]['Enums']["metodo_pago"],"monto": number,"motivo_anulacion"?: string | null,"notas"?: string | null,"paciente_id": string,"pagado_at"?: string,"plan_tratamiento_id"?: string | null,"recibido_por"?: string | null,"recibo_numero"?: never,"referencia"?: string | null
                  }
                  Update: {
                    "anulado"?: boolean,"anulado_at"?: string | null,"anulado_por"?: string | null,"cita_id"?: string | null,"concepto"?: string,"created_at"?: string,"cuota_id"?: string | null,"id"?: string,"metodo"?: Database["public"]['Enums']["metodo_pago"],"monto"?: number,"motivo_anulacion"?: string | null,"notas"?: string | null,"paciente_id"?: string,"pagado_at"?: string,"plan_tratamiento_id"?: string | null,"recibido_por"?: string | null,"recibo_numero"?: never,"referencia"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "abonos_anulado_por_fkey"
      columns: ["anulado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "abonos_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "abonos_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "abonos_cuota_id_fkey"
      columns: ["cuota_id"]
isOneToOne: false
      referencedRelation: "cuotas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "abonos_cuota_id_fkey"
      columns: ["cuota_id"]
isOneToOne: false
      referencedRelation: "v_cuotas_estado"
      referencedColumns: ["cuota_id"]
    },{
      foreignKeyName: "abonos_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "abonos_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "abonos_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "planes_tratamiento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "abonos_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "v_saldo_planes"
      referencedColumns: ["plan_id"]
    },{
      foreignKeyName: "abonos_recibido_por_fkey"
      columns: ["recibido_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"archivos_paciente": {
                  Row: {
                    "created_at": string,"descripcion": string | null,"id": string,"nota_id": string | null,"paciente_id": string,"storage_path": string,"subido_por": string | null,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"descripcion"?: string | null,"id"?: string,"nota_id"?: string | null,"paciente_id": string,"storage_path": string,"subido_por"?: string | null,"tipo": string
                  }
                  Update: {
                    "created_at"?: string,"descripcion"?: string | null,"id"?: string,"nota_id"?: string | null,"paciente_id"?: string,"storage_path"?: string,"subido_por"?: string | null,"tipo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "archivos_paciente_nota_id_fkey"
      columns: ["nota_id"]
isOneToOne: false
      referencedRelation: "notas_clinicas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "archivos_paciente_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "archivos_paciente_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "archivos_paciente_subido_por_fkey"
      columns: ["subido_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"auditoria": {
                  Row: {
                    "accion": string,"created_at": string,"datos_anteriores": Json | null,"datos_nuevos": Json | null,"id": number,"registro_id": string | null,"rol_db": string,"tabla": string,"usuario_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accion": string,"created_at"?: string,"datos_anteriores"?: Json | null,"datos_nuevos"?: Json | null,"id"?: never,"registro_id"?: string | null,"rol_db"?: string,"tabla": string,"usuario_id"?: string | null
                  }
                  Update: {
                    "accion"?: string,"created_at"?: string,"datos_anteriores"?: Json | null,"datos_nuevos"?: Json | null,"id"?: never,"registro_id"?: string | null,"rol_db"?: string,"tabla"?: string,"usuario_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"bloqueos_agenda": {
                  Row: {
                    "creado_por": string | null,"created_at": string,"doctor_id": string,"fin": string,"id": string,"inicio": string,"motivo": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_por"?: string | null,"created_at"?: string,"doctor_id": string,"fin": string,"id"?: string,"inicio": string,"motivo"?: string | null
                  }
                  Update: {
                    "creado_por"?: string | null,"created_at"?: string,"doctor_id"?: string,"fin"?: string,"id"?: string,"inicio"?: string,"motivo"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "bloqueos_agenda_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bloqueos_agenda_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bloqueos_agenda_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["doctor_id"]
    }
                  ]
                },"casos_clinicos": {
                  Row: {
                    "consentimiento_publicacion": boolean,"created_at": string,"descripcion": string | null,"id": string,"imagen_antes": string | null,"imagen_despues": string | null,"orden": number,"paciente_id": string | null,"publicado": boolean,"titulo": string,"tratamiento_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "consentimiento_publicacion"?: boolean,"created_at"?: string,"descripcion"?: string | null,"id"?: string,"imagen_antes"?: string | null,"imagen_despues"?: string | null,"orden"?: number,"paciente_id"?: string | null,"publicado"?: boolean,"titulo": string,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "consentimiento_publicacion"?: boolean,"created_at"?: string,"descripcion"?: string | null,"id"?: string,"imagen_antes"?: string | null,"imagen_despues"?: string | null,"orden"?: number,"paciente_id"?: string | null,"publicado"?: boolean,"titulo"?: string,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "casos_clinicos_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "casos_clinicos_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "casos_clinicos_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"citas": {
                  Row: {
                    "cancelada_at": string | null,"confirmada_at": string | null,"creado_por": string | null,"created_at": string,"doctor_id": string,"estado": Database["public"]['Enums']["estado_cita"],"fin": string,"id": string,"inicio": string,"motivo": string | null,"motivo_cancelacion": string | null,"notas": string | null,"origen": string,"paciente_id": string,"recordatorio_enviado_at": string | null,"reprogramada_de": string | null,"tratamiento_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cancelada_at"?: string | null,"confirmada_at"?: string | null,"creado_por"?: string | null,"created_at"?: string,"doctor_id": string,"estado"?: Database["public"]['Enums']["estado_cita"],"fin": string,"id"?: string,"inicio": string,"motivo"?: string | null,"motivo_cancelacion"?: string | null,"notas"?: string | null,"origen"?: string,"paciente_id": string,"recordatorio_enviado_at"?: string | null,"reprogramada_de"?: string | null,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "cancelada_at"?: string | null,"confirmada_at"?: string | null,"creado_por"?: string | null,"created_at"?: string,"doctor_id"?: string,"estado"?: Database["public"]['Enums']["estado_cita"],"fin"?: string,"id"?: string,"inicio"?: string,"motivo"?: string | null,"motivo_cancelacion"?: string | null,"notas"?: string | null,"origen"?: string,"paciente_id"?: string,"recordatorio_enviado_at"?: string | null,"reprogramada_de"?: string | null,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "citas_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citas_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citas_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["doctor_id"]
    },{
      foreignKeyName: "citas_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citas_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "citas_reprogramada_de_fkey"
      columns: ["reprogramada_de"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "citas_reprogramada_de_fkey"
      columns: ["reprogramada_de"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "citas_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"cuotas": {
                  Row: {
                    "estado": Database["public"]['Enums']["estado_cuota"],"fecha_vencimiento": string,"id": string,"monto": number,"numero": number,"plan_pago_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "estado"?: Database["public"]['Enums']["estado_cuota"],"fecha_vencimiento": string,"id"?: string,"monto": number,"numero": number,"plan_pago_id": string
                  }
                  Update: {
                    "estado"?: Database["public"]['Enums']["estado_cuota"],"fecha_vencimiento"?: string,"id"?: string,"monto"?: number,"numero"?: number,"plan_pago_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cuotas_plan_pago_id_fkey"
      columns: ["plan_pago_id"]
isOneToOne: false
      referencedRelation: "planes_pago"
      referencedColumns: ["id"]
    }
                  ]
                },"doctores": {
                  Row: {
                    "activo": boolean,"correo": string | null,"created_at": string,"especialidad": string | null,"id": string,"nombre": string,"perfil_id": string | null,"telefono": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"correo"?: string | null,"created_at"?: string,"especialidad"?: string | null,"id"?: string,"nombre": string,"perfil_id"?: string | null,"telefono"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "activo"?: boolean,"correo"?: string | null,"created_at"?: string,"especialidad"?: string | null,"id"?: string,"nombre"?: string,"perfil_id"?: string | null,"telefono"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "doctores_perfil_id_fkey"
      columns: ["perfil_id"]
isOneToOne: true
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"horarios_atencion": {
                  Row: {
                    "dia_semana": number,"doctor_id": string,"hora_fin": string,"hora_inicio": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "dia_semana": number,"doctor_id": string,"hora_fin": string,"hora_inicio": string,"id"?: string
                  }
                  Update: {
                    "dia_semana"?: number,"doctor_id"?: string,"hora_fin"?: string,"hora_inicio"?: string,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "horarios_atencion_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "horarios_atencion_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["doctor_id"]
    }
                  ]
                },"implantes": {
                  Row: {
                    "activo": boolean,"created_at": string,"diametro_mm": number | null,"fecha_carga": string | null,"fecha_colocacion": string | null,"hallazgo_id": string | null,"id": string,"longitud_mm": number | null,"marca": string | null,"modelo": string | null,"observaciones": string | null,"paciente_id": string,"pieza": number,"registrado_por": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"created_at"?: string,"diametro_mm"?: number | null,"fecha_carga"?: string | null,"fecha_colocacion"?: string | null,"hallazgo_id"?: string | null,"id"?: string,"longitud_mm"?: number | null,"marca"?: string | null,"modelo"?: string | null,"observaciones"?: string | null,"paciente_id": string,"pieza": number,"registrado_por"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "activo"?: boolean,"created_at"?: string,"diametro_mm"?: number | null,"fecha_carga"?: string | null,"fecha_colocacion"?: string | null,"hallazgo_id"?: string | null,"id"?: string,"longitud_mm"?: number | null,"marca"?: string | null,"modelo"?: string | null,"observaciones"?: string | null,"paciente_id"?: string,"pieza"?: number,"registrado_por"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "implantes_hallazgo_id_fkey"
      columns: ["hallazgo_id"]
isOneToOne: false
      referencedRelation: "odontograma"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "implantes_hallazgo_id_fkey"
      columns: ["hallazgo_id"]
isOneToOne: false
      referencedRelation: "v_odontograma_actual"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "implantes_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "implantes_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "implantes_registrado_por_fkey"
      columns: ["registrado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"mensajes_whatsapp": {
                  Row: {
                    "cita_id": string | null,"contenido": string | null,"created_at": string,"direccion": Database["public"]['Enums']["direccion_mensaje"],"estado_envio": string | null,"id": string,"paciente_id": string | null,"proveedor_id": string | null,"telefono": string,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cita_id"?: string | null,"contenido"?: string | null,"created_at"?: string,"direccion": Database["public"]['Enums']["direccion_mensaje"],"estado_envio"?: string | null,"id"?: string,"paciente_id"?: string | null,"proveedor_id"?: string | null,"telefono": string,"tipo"?: string
                  }
                  Update: {
                    "cita_id"?: string | null,"contenido"?: string | null,"created_at"?: string,"direccion"?: Database["public"]['Enums']["direccion_mensaje"],"estado_envio"?: string | null,"id"?: string,"paciente_id"?: string | null,"proveedor_id"?: string | null,"telefono"?: string,"tipo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mensajes_whatsapp_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mensajes_whatsapp_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "mensajes_whatsapp_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mensajes_whatsapp_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                },"notas_clinicas": {
                  Row: {
                    "cita_id": string | null,"creado_por": string | null,"created_at": string,"diagnostico": string | null,"doctor_id": string | null,"id": string,"indicaciones": string | null,"motivo_consulta": string | null,"paciente_id": string,"piezas_dentales": (number)[] | null,"procedimiento_realizado": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cita_id"?: string | null,"creado_por"?: string | null,"created_at"?: string,"diagnostico"?: string | null,"doctor_id"?: string | null,"id"?: string,"indicaciones"?: string | null,"motivo_consulta"?: string | null,"paciente_id": string,"piezas_dentales"?: (number)[] | null,"procedimiento_realizado"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "cita_id"?: string | null,"creado_por"?: string | null,"created_at"?: string,"diagnostico"?: string | null,"doctor_id"?: string | null,"id"?: string,"indicaciones"?: string | null,"motivo_consulta"?: string | null,"paciente_id"?: string,"piezas_dentales"?: (number)[] | null,"procedimiento_realizado"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notas_clinicas_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notas_clinicas_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "notas_clinicas_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notas_clinicas_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notas_clinicas_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["doctor_id"]
    },{
      foreignKeyName: "notas_clinicas_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notas_clinicas_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                },"odontograma": {
                  Row: {
                    "anulado": boolean,"anulado_at": string | null,"anulado_por": string | null,"cara": Database["public"]['Enums']["cara_dental"],"cita_id": string | null,"condicion": Database["public"]['Enums']["condicion_dental"],"created_at": string,"diagnostico": string | null,"estado": Database["public"]['Enums']["estado_hallazgo"],"id": string,"motivo_anulacion": string | null,"nota_id": string | null,"observacion": string | null,"paciente_id": string,"pieza": number,"registrado_por": string | null,"tratamiento_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "anulado"?: boolean,"anulado_at"?: string | null,"anulado_por"?: string | null,"cara"?: Database["public"]['Enums']["cara_dental"],"cita_id"?: string | null,"condicion": Database["public"]['Enums']["condicion_dental"],"created_at"?: string,"diagnostico"?: string | null,"estado"?: Database["public"]['Enums']["estado_hallazgo"],"id"?: string,"motivo_anulacion"?: string | null,"nota_id"?: string | null,"observacion"?: string | null,"paciente_id": string,"pieza": number,"registrado_por"?: string | null,"tratamiento_id"?: string | null
                  }
                  Update: {
                    "anulado"?: boolean,"anulado_at"?: string | null,"anulado_por"?: string | null,"cara"?: Database["public"]['Enums']["cara_dental"],"cita_id"?: string | null,"condicion"?: Database["public"]['Enums']["condicion_dental"],"created_at"?: string,"diagnostico"?: string | null,"estado"?: Database["public"]['Enums']["estado_hallazgo"],"id"?: string,"motivo_anulacion"?: string | null,"nota_id"?: string | null,"observacion"?: string | null,"paciente_id"?: string,"pieza"?: number,"registrado_por"?: string | null,"tratamiento_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "odontograma_anulado_por_fkey"
      columns: ["anulado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_cita_id_fkey"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "odontograma_nota_id_fkey"
      columns: ["nota_id"]
isOneToOne: false
      referencedRelation: "notas_clinicas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "odontograma_registrado_por_fkey"
      columns: ["registrado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"pacientes": {
                  Row: {
                    "activo": boolean,"alergias": string | null,"antecedentes_medicos": string | null,"contacto_emergencia": string | null,"correo": string | null,"created_at": string,"direccion": string | null,"fecha_nacimiento": string | null,"id": string,"identidad": string | null,"medicamentos_actuales": string | null,"nombre_completo": string,"notas": string | null,"numero_expediente": number,"ocupacion": string | null,"origen": string,"sexo": string | null,"telefono": string,"telefono_emergencia": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"alergias"?: string | null,"antecedentes_medicos"?: string | null,"contacto_emergencia"?: string | null,"correo"?: string | null,"created_at"?: string,"direccion"?: string | null,"fecha_nacimiento"?: string | null,"id"?: string,"identidad"?: string | null,"medicamentos_actuales"?: string | null,"nombre_completo": string,"notas"?: string | null,"numero_expediente"?: never,"ocupacion"?: string | null,"origen"?: string,"sexo"?: string | null,"telefono": string,"telefono_emergencia"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "activo"?: boolean,"alergias"?: string | null,"antecedentes_medicos"?: string | null,"contacto_emergencia"?: string | null,"correo"?: string | null,"created_at"?: string,"direccion"?: string | null,"fecha_nacimiento"?: string | null,"id"?: string,"identidad"?: string | null,"medicamentos_actuales"?: string | null,"nombre_completo"?: string,"notas"?: string | null,"numero_expediente"?: never,"ocupacion"?: string | null,"origen"?: string,"sexo"?: string | null,"telefono"?: string,"telefono_emergencia"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"perfiles": {
                  Row: {
                    "activo": boolean,"correo": string | null,"created_at": string,"id": string,"nombre_completo": string,"rol_id": number | null,"telefono": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"correo"?: string | null,"created_at"?: string,"id": string,"nombre_completo"?: string,"rol_id"?: number | null,"telefono"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "activo"?: boolean,"correo"?: string | null,"created_at"?: string,"id"?: string,"nombre_completo"?: string,"rol_id"?: number | null,"telefono"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "perfiles_rol_id_fkey"
      columns: ["rol_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"permisos": {
                  Row: {
                    "codigo": string,"descripcion": string
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo": string,"descripcion": string
                  }
                  Update: {
                    "codigo"?: string,"descripcion"?: string
                  }
                  Relationships: [
                    
                  ]
                },"plan_items": {
                  Row: {
                    "cantidad": number,"completado": boolean,"descripcion": string,"id": string,"orden": number,"pieza": number | null,"plan_id": string,"precio_unitario": number,"tratamiento_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "cantidad"?: number,"completado"?: boolean,"descripcion": string,"id"?: string,"orden"?: number,"pieza"?: number | null,"plan_id": string,"precio_unitario": number,"tratamiento_id"?: string | null
                  }
                  Update: {
                    "cantidad"?: number,"completado"?: boolean,"descripcion"?: string,"id"?: string,"orden"?: number,"pieza"?: number | null,"plan_id"?: string,"precio_unitario"?: number,"tratamiento_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_items_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "planes_tratamiento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plan_items_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "v_saldo_planes"
      referencedColumns: ["plan_id"]
    },{
      foreignKeyName: "plan_items_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"planes_pago": {
                  Row: {
                    "activo": boolean,"creado_por": string | null,"created_at": string,"fecha_inicio": string,"frecuencia": Database["public"]['Enums']["frecuencia_pago"],"id": string,"monto_total": number,"notas": string | null,"numero_cuotas": number,"plan_tratamiento_id": string,"prima": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"creado_por"?: string | null,"created_at"?: string,"fecha_inicio": string,"frecuencia"?: Database["public"]['Enums']["frecuencia_pago"],"id"?: string,"monto_total": number,"notas"?: string | null,"numero_cuotas": number,"plan_tratamiento_id": string,"prima"?: number,"updated_at"?: string
                  }
                  Update: {
                    "activo"?: boolean,"creado_por"?: string | null,"created_at"?: string,"fecha_inicio"?: string,"frecuencia"?: Database["public"]['Enums']["frecuencia_pago"],"id"?: string,"monto_total"?: number,"notas"?: string | null,"numero_cuotas"?: number,"plan_tratamiento_id"?: string,"prima"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "planes_pago_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_pago_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "planes_tratamiento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_pago_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "v_saldo_planes"
      referencedColumns: ["plan_id"]
    }
                  ]
                },"planes_tratamiento": {
                  Row: {
                    "aceptado_at": string | null,"creado_por": string | null,"created_at": string,"descuento": number,"doctor_id": string | null,"estado": Database["public"]['Enums']["estado_plan"],"id": string,"notas": string | null,"paciente_id": string,"titulo": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "aceptado_at"?: string | null,"creado_por"?: string | null,"created_at"?: string,"descuento"?: number,"doctor_id"?: string | null,"estado"?: Database["public"]['Enums']["estado_plan"],"id"?: string,"notas"?: string | null,"paciente_id": string,"titulo": string,"updated_at"?: string
                  }
                  Update: {
                    "aceptado_at"?: string | null,"creado_por"?: string | null,"created_at"?: string,"descuento"?: number,"doctor_id"?: string | null,"estado"?: Database["public"]['Enums']["estado_plan"],"id"?: string,"notas"?: string | null,"paciente_id"?: string,"titulo"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "planes_tratamiento_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "doctores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["doctor_id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                },"rol_permisos": {
                  Row: {
                    "permiso": string,"rol_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "permiso": string,"rol_id": number
                  }
                  Update: {
                    "permiso"?: string,"rol_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "rol_permisos_permiso_fkey"
      columns: ["permiso"]
isOneToOne: false
      referencedRelation: "permisos"
      referencedColumns: ["codigo"]
    },{
      foreignKeyName: "rol_permisos_rol_id_fkey"
      columns: ["rol_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "descripcion": string | null,"id": number,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "descripcion"?: string | null,"id"?: never,"nombre": string
                  }
                  Update: {
                    "descripcion"?: string | null,"id"?: never,"nombre"?: string
                  }
                  Relationships: [
                    
                  ]
                },"solicitudes_cita": {
                  Row: {
                    "cita_id": string | null,"correo": string | null,"created_at": string,"datos_crudos": Json | null,"estado": Database["public"]['Enums']["estado_solicitud"],"fecha_preferida": string | null,"horario_preferido": string | null,"id": string,"motivo": string | null,"nombre": string,"origen": string,"paciente_id": string | null,"telefono": string,"tratamiento_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cita_id"?: string | null,"correo"?: string | null,"created_at"?: string,"datos_crudos"?: Json | null,"estado"?: Database["public"]['Enums']["estado_solicitud"],"fecha_preferida"?: string | null,"horario_preferido"?: string | null,"id"?: string,"motivo"?: string | null,"nombre": string,"origen"?: string,"paciente_id"?: string | null,"telefono": string,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "cita_id"?: string | null,"correo"?: string | null,"created_at"?: string,"datos_crudos"?: Json | null,"estado"?: Database["public"]['Enums']["estado_solicitud"],"fecha_preferida"?: string | null,"horario_preferido"?: string | null,"id"?: string,"motivo"?: string | null,"nombre"?: string,"origen"?: string,"paciente_id"?: string | null,"telefono"?: string,"tratamiento_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "solicitudes_cita_cita_fk"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "citas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "solicitudes_cita_cita_fk"
      columns: ["cita_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["cita_id"]
    },{
      foreignKeyName: "solicitudes_cita_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "solicitudes_cita_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "solicitudes_cita_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"tratamientos": {
                  Row: {
                    "activo": boolean,"categoria": string | null,"contraindicaciones": string | null,"created_at": string,"cuidados_posteriores": string | null,"descripcion": string | null,"duracion_minutos": number,"id": string,"indicaciones": string | null,"nombre": string,"orden": number,"precio_referencia": number | null,"reservable_web": boolean,"slug": string,"updated_at": string,"visible_web": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"categoria"?: string | null,"contraindicaciones"?: string | null,"created_at"?: string,"cuidados_posteriores"?: string | null,"descripcion"?: string | null,"duracion_minutos"?: number,"id"?: string,"indicaciones"?: string | null,"nombre": string,"orden"?: number,"precio_referencia"?: number | null,"reservable_web"?: boolean,"slug": string,"updated_at"?: string,"visible_web"?: boolean
                  }
                  Update: {
                    "activo"?: boolean,"categoria"?: string | null,"contraindicaciones"?: string | null,"created_at"?: string,"cuidados_posteriores"?: string | null,"descripcion"?: string | null,"duracion_minutos"?: number,"id"?: string,"indicaciones"?: string | null,"nombre"?: string,"orden"?: number,"precio_referencia"?: number | null,"reservable_web"?: boolean,"slug"?: string,"updated_at"?: string,"visible_web"?: boolean
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "v_agenda": {
                  Row: {
                    "cita_id": string | null,"doctor": string | null,"doctor_id": string | null,"estado": Database["public"]['Enums']["estado_cita"] | null,"fin": string | null,"inicio": string | null,"inicio_local": string | null,"paciente": string | null,"paciente_id": string | null,"recordatorio_enviado_at": string | null,"telefono": string | null,"tratamiento": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"v_cuotas_estado": {
                  Row: {
                    "cuota_id": string | null,"estado_calculado": string | null,"fecha_vencimiento": string | null,"monto": number | null,"numero": number | null,"paciente_id": string | null,"pagado": number | null,"pendiente": number | null,"plan_pago_id": string | null,"plan_tratamiento_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "cuotas_plan_pago_id_fkey"
      columns: ["plan_pago_id"]
isOneToOne: false
      referencedRelation: "planes_pago"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_pago_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "planes_tratamiento"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_pago_plan_tratamiento_id_fkey"
      columns: ["plan_tratamiento_id"]
isOneToOne: false
      referencedRelation: "v_saldo_planes"
      referencedColumns: ["plan_id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                },"v_estado_cuenta": {
                  Row: {
                    "costo_total": number | null,"paciente_id": string | null,"planes": number | null,"por_pagar": number | null,"total_abonado": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                },"v_odontograma_actual": {
                  Row: {
                    "cara": Database["public"]['Enums']["cara_dental"] | null,"condicion": Database["public"]['Enums']["condicion_dental"] | null,"diagnostico": string | null,"estado": Database["public"]['Enums']["estado_hallazgo"] | null,"id": string | null,"observacion": string | null,"paciente_id": string | null,"pieza": number | null,"registrado_at": string | null,"tratamiento": string | null,"tratamiento_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "odontograma_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "odontograma_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    },{
      foreignKeyName: "odontograma_tratamiento_id_fkey"
      columns: ["tratamiento_id"]
isOneToOne: false
      referencedRelation: "tratamientos"
      referencedColumns: ["id"]
    }
                  ]
                },"v_saldo_planes": {
                  Row: {
                    "estado": Database["public"]['Enums']["estado_plan"] | null,"paciente_id": string | null,"pagado": number | null,"plan_id": string | null,"saldo": number | null,"titulo": string | null,"total": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "pacientes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planes_tratamiento_paciente_id_fkey"
      columns: ["paciente_id"]
isOneToOne: false
      referencedRelation: "v_agenda"
      referencedColumns: ["paciente_id"]
    }
                  ]
                }
          }
          Functions: {
            "eliminar_paciente_sin_atencion":
{ Args: { "p_paciente": string }; Returns: Json
                           },
"generar_cuotas":
{ Args: { "p_plan_pago_id": string }; Returns: {
              "estado": Database["public"]['Enums']["estado_cuota"],
"fecha_vencimiento": string,
"id": string,
"monto": number,
"numero": number,
"plan_pago_id": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "cuotas"
        isOneToOne: false
        isSetofReturn: true
      } },
"horarios_disponibles":
{ Args: { "p_doctor_id"?: string,"p_fecha": string,"p_intervalo_min"?: number,"p_tratamiento_slug"?: string }; Returns: {
              "doctor": string,"doctor_id": string,"fin": string,"hora_local": string,"inicio": string
            }[]
                           },
"mis_permisos":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"motivo_no_eliminable":
{ Args: { "p_paciente": string }; Returns: string
                           },
"nombres_personal":
{ Args: { "p_ids": (string)[] }; Returns: {
              "id": string,"nombre": string
            }[]
                           },
"tiene_permiso":
{ Args: { "p_permiso": string }; Returns: boolean
                           },
"web_horarios":
{ Args: { "p_fecha": string,"p_servicio": string }; Returns: {
              "hora_local": string,"inicio": string
            }[]
                           },
"web_reservar_cita":
{ Args: { "p_correo"?: string,"p_inicio": string,"p_motivo"?: string,"p_nombre": string,"p_servicio": string,"p_telefono": string }; Returns: Json
                           },
"web_servicios":
{ Args: Record<PropertyKey, never>; Returns: {
              "descripcion": string,"duracion_minutos": number,"nombre": string,"slug": string
            }[]
                           }
          }
          Enums: {
            "cara_dental": "oclusal"|"mesial"|"distal"|"vestibular"|"lingual"|"completa"|"palatina"|"incisal"|"cervical"|"radicular","condicion_dental": "sano"|"caries"|"obturado"|"ausente"|"extraccion_indicada"|"endodoncia"|"corona"|"implante"|"puente"|"protesis"|"fractura"|"sellante"|"otro","direccion_mensaje": "entrante"|"saliente","estado_cita": "pendiente"|"confirmada"|"completada"|"cancelada"|"no_asistio"|"reprogramada","estado_cuota": "pendiente"|"parcial"|"pagada"|"vencida"|"anulada","estado_hallazgo": "existente"|"planificado"|"realizado","estado_plan": "propuesto"|"aceptado"|"en_curso"|"finalizado"|"rechazado","estado_solicitud": "nueva"|"contactada"|"agendada"|"descartada","frecuencia_pago": "semanal"|"quincenal"|"mensual","metodo_pago": "efectivo"|"tarjeta"|"transferencia"|"otro"|"deposito"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "cara_dental": ["oclusal", "mesial", "distal", "vestibular", "lingual", "completa", "palatina", "incisal", "cervical", "radicular"],"condicion_dental": ["sano", "caries", "obturado", "ausente", "extraccion_indicada", "endodoncia", "corona", "implante", "puente", "protesis", "fractura", "sellante", "otro"],"direccion_mensaje": ["entrante", "saliente"],"estado_cita": ["pendiente", "confirmada", "completada", "cancelada", "no_asistio", "reprogramada"],"estado_cuota": ["pendiente", "parcial", "pagada", "vencida", "anulada"],"estado_hallazgo": ["existente", "planificado", "realizado"],"estado_plan": ["propuesto", "aceptado", "en_curso", "finalizado", "rechazado"],"estado_solicitud": ["nueva", "contactada", "agendada", "descartada"],"frecuencia_pago": ["semanal", "quincenal", "mensual"],"metodo_pago": ["efectivo", "tarjeta", "transferencia", "otro", "deposito"]
          }
        }
} as const
