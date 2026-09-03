export type ProfessionalRole = "owner" | "manager" | "staff"

export type ProfessionalMembership = {
  professionalId: string
  userId: string
  role: ProfessionalRole
}
