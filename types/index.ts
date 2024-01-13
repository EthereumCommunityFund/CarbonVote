export type PollType = {
  id: string,
  creator: string,
  startDate: Date | string,
  endDate: Date | string,
  isLive: boolean,
  title: string,
  description: string,
  topic: string,
  subTopic: string,
  isZuPassRequired: boolean
}

export type OptionType = {
  name: string,
  isChecked: boolean,
}

export type Event = {
  id: number
  fancy_id: string
  name: string
  description: string
  location_type: string
  city: string
  country: string
  channel: string
  platform: string
  event_url: string
  image_url: string
  animation_url: string
  year: number
  start_date: string
  end_date: string
  expiry_date: string
  timezone: string
  from_admin: boolean
  virtual_event: boolean
  event_template_id: string
  private_event: boolean
}

export type PillInputs = {
  event: Event,
  onRemove: (id: number) => void;
}
