export interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  click_action_type: string;
  click_action_value: string | null;
  image_fit_mode: string;
  auto_slide_interval: number;
}

export interface BannerClickAction {
  type: string;
  value: string | null;
}
