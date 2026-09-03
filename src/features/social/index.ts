export type SocialVisibility = "draft" | "published" | "archived"

export type SocialPost = {
  id: string
  professionalId: string
  body: string
  visibility: SocialVisibility
}
