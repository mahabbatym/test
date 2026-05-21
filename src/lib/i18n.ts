export type Locale = "kk" | "ru" | "ko" | "en";

export const locales: Array<{ code: Locale; label: string }> = [
  { code: "kk", label: "Қазақша" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

const shared = {
  play: {
    kk: "Ойнау",
    ru: "Играть",
    ko: "플레이",
    en: "Play",
  },
  dashboard: {
    kk: "Тақта",
    ru: "Панель",
    ko: "대시보드",
    en: "Dashboard",
  },
  leaderboard: {
    kk: "Рейтинг",
    ru: "Рейтинг",
    ko: "리더보드",
    en: "Leaderboard",
  },
  profile: {
    kk: "Профиль",
    ru: "Профиль",
    ko: "프로필",
    en: "Profile",
  },
  store: {
    kk: "Premium",
    ru: "Premium",
    ko: "프리미엄",
    en: "Store",
  },
  theme: {
    kk: "Тақырып",
    ru: "Тема",
    ko: "테마",
    en: "Theme",
  },
  language: {
    kk: "Тіл",
    ru: "Язык",
    ko: "언어",
    en: "Language",
  },
  feedback: {
    kk: "Қате / ұсыныс",
    ru: "Ошибка / идея",
    ko: "버그 / 제안",
    en: "Feedback",
  },
  reportTitle: {
    kk: "Cherry командасына хабарлау",
    ru: "Сообщить команде Cherry",
    ko: "Cherry 팀에 보내기",
    en: "Report to the Cherry team",
  },
  reportType: {
    kk: "Түрі",
    ru: "Тип",
    ko: "유형",
    en: "Type",
  },
  bug: {
    kk: "Қате",
    ru: "Ошибка",
    ko: "버그",
    en: "Bug",
  },
  suggestion: {
    kk: "Ұсыныс",
    ru: "Идея",
    ko: "제안",
    en: "Suggestion",
  },
  reportMessage: {
    kk: "Не байқадыңыз?",
    ru: "Что вы заметили?",
    ko: "무엇을 발견했나요?",
    en: "What did you notice?",
  },
  send: {
    kk: "Жіберу",
    ru: "Отправить",
    ko: "보내기",
    en: "Send",
  },
  sending: {
    kk: "Жіберілуде...",
    ru: "Отправка...",
    ko: "보내는 중...",
    en: "Sending...",
  },
  sent: {
    kk: "Рахмет, хабарлама сақталды.",
    ru: "Спасибо, сообщение сохранено.",
    ko: "감사합니다. 피드백이 저장되었습니다.",
    en: "Thanks, your message was saved.",
  },
  signIn: {
    kk: "Кіру",
    ru: "Войти",
    ko: "로그인",
    en: "Sign in",
  },
  signOut: {
    kk: "Шығу",
    ru: "Выйти",
    ko: "로그아웃",
    en: "Sign out",
  },
  settings: {
    kk: "Баптаулар",
    ru: "Настройки",
    ko: "설정",
    en: "Settings",
  },
  level: {
    kk: "Деңгей",
    ru: "Уровень",
    ko: "레벨",
    en: "Level",
  },
  rewards: {
    kk: "Сыйақы",
    ru: "Награда",
    ko: "보상",
    en: "Rewards",
  },
  hearts: {
    kk: "Жүректер",
    ru: "Сердца",
    ko: "하트",
    en: "Hearts",
  },
  premium: {
    kk: "Cherry Pro",
    ru: "Cherry Pro",
    ko: "Cherry Pro",
    en: "Cherry Pro",
  },
  check: {
    kk: "Шах",
    ru: "Шах",
    ko: "체크",
    en: "Check",
  },
  checkmate: {
    kk: "Мат",
    ru: "Мат",
    ko: "체크메이트",
    en: "Checkmate",
  },
  stalemate: {
    kk: "Пат",
    ru: "Пат",
    ko: "스테일메이트",
    en: "Stalemate",
  },
  resign: {
    kk: "Берілу",
    ru: "Сдаться",
    ko: "기권",
    en: "Resign",
  },
  draw: {
    kk: "Тең ойын",
    ru: "Ничья",
    ko: "무승부",
    en: "Draw",
  },
  invite: {
    kk: "Шақыру",
    ru: "Пригласить",
    ko: "초대",
    en: "Invite",
  },
  copied: {
    kk: "Көшірілді",
    ru: "Скопировано",
    ko: "복사됨",
    en: "Copied",
  },
  flip: {
    kk: "Аудару",
    ru: "Перевернуть",
    ko: "뒤집기",
    en: "Flip",
  },
  sound: {
    kk: "Дыбыс",
    ru: "Звук",
    ko: "소리",
    en: "Sound",
  },
} as const;

function buildMessages() {
  const locales = Object.keys(shared.play) as Locale[];
  const catalogue: Record<Locale, Record<string, string>> = {
    kk: {},
    ru: {},
    ko: {},
    en: {},
  };

  function assign(key: string, values: Record<Locale, string>) {
    for (const locale of locales) {
      catalogue[locale][key] = values[locale];
    }
  }

  for (const [key, value] of Object.entries(shared)) {
    assign(key, value as Record<Locale, string>);
  }

  // Home
  assign("home_badge", {
    kk: "Премиум онлайн шахмат",
    ru: "Премиальные онлайн шахматы",
    ko: "프리미엄 온라인 체스",
    en: "Premium online chess",
  });
  assign("home_title_prefix", {
    kk: "Шахмат ойнаңыз",
    ru: "Играйте в шахматы",
    ko: "체스를 즐기세요",
    en: "Play chess on",
  });
  assign("home_title_highlight", {
    kk: "Cherry",
    ru: "Cherry",
    ko: "Cherry",
    en: "Cherry",
  });
  assign("home_subtitle", {
    kk: "Заңды жүрістер, заманауи сезім және шие түстес эстетикасы бар минималистік тәжірибе.",
    ru: "Минималистичный, премиальный опыт с проверкой ходов и фирменной вишнёвой эстетикой.",
    ko: "합법적 수 검증과 체리 톤 미학을 갖춘 미니멀한 프리미엄 체스 경험.",
    en: "A minimal, high-end chess experience with legal-move validation, real-time feel, and a refined cherry-red aesthetic.",
  });
  assign("home_play_now", {
    kk: "Қазір ойнау",
    ru: "Играть сейчас",
    ko: "지금 플레이",
    en: "Play now",
  });
  assign("home_open_dashboard", {
    kk: "Тақтаны ашу",
    ru: "Открыть панель",
    ko: "대시보드 열기",
    en: "Open dashboard",
  });

  // Dashboard
  assign("dashboard_tagline", {
    kk: "Cherry Command",
    ru: "Команда Cherry",
    ko: "체리 커맨드",
    en: "Cherry Command",
  });
  assign("dashboard_subtitle", {
    kk: "Жаңа партия бастаңдар, прогресті бақылаңдар және премиум жүйелерге қосылыңдар.",
    ru: "Начните партию, следите за прогрессом и переходите к премиальным режимам.",
    ko: "새 대국을 시작하고 진행 상황을 확인하며 프리미엄 시스템으로 이동하세요.",
    en: "Start a match, review progression, and jump into premium systems.",
  });
  assign("dashboard_card_ai_title", {
    kk: "Solo AI баспалдақ",
    ru: "Соло AI лестница",
    ko: "솔로 AI 래더",
    en: "Solo AI Ladder",
  });
  assign("dashboard_card_ai_text", {
    kk: "Stockfish қиындықтары айқын сегіз кезең, сыйақылар өседі.",
    ru: "Восемь этапов Stockfish с возрастающими наградами.",
    ko: "난도가 높아지는 8단계 Stockfish 챌린지와 보상.",
    en: "Eight explicit Stockfish stages with escalating rewards.",
  });
  assign("dashboard_card_leaderboard_title", {
    kk: "Рейтинг",
    ru: "Лидерборд",
    ko: "리더보드",
    en: "Leaderboard",
  });
  assign("dashboard_card_leaderboard_text", {
    kk: "Ғаламдық және қала рейтингтерін бақылаңыз.",
    ru: "Следите за глобальными и городскими рейтингами ELO.",
    ko: "전 세계와 도시별 ELO 변화를 추적하세요.",
    en: "Track global and city ELO movement.",
  });
  assign("dashboard_card_store_title", {
    kk: "Cherry Pro",
    ru: "Cherry Pro",
    ko: "Cherry Pro",
    en: "Cherry Pro",
  });
  assign("dashboard_card_store_text", {
    kk: "Шексіз жүректер және бірегей көрініс терілері.",
    ru: "Бесконечные сердца и кастомные визуальные темы.",
    ko: "무한 하트와 독점 비주얼 스킨.",
    en: "Infinite hearts and custom visual skins.",
  });

  assign("dashboard_stat_games", {
    kk: "Ойындар",
    ru: "Игры",
    ko: "대국 수",
    en: "Games",
  });
  assign("dashboard_stat_games_hint", {
    kk: "{wins} жеңіс · {losses} жеңіліс · {draws} тең",
    ru: "{wins} побед · {losses} поражений · {draws} ничьих",
    ko: "승 {wins} · 패 {losses} · 무 {draws}",
    en: "{wins} wins · {losses} losses · {draws} draws",
  });
  assign("dashboard_stat_winrate", {
    kk: "Жеңіс пайызы",
    ru: "Процент побед",
    ko: "승률",
    en: "Win rate",
  });
  assign("dashboard_stat_winrate_hint", {
    kk: "Соңғы 20 партия негізінде",
    ru: "На основе последних 20 игр",
    ko: "최근 20판 기준",
    en: "Based on the last 20 games",
  });
  assign("dashboard_stat_active", {
    kk: "Белсенді ойындар",
    ru: "Активные партии",
    ko: "진행 중",
    en: "Active games",
  });
  assign("dashboard_stat_active_hint", {
    kk: "Қазір жалғасып жатқан партиялар",
    ru: "Партии, которые идут прямо сейчас",
    ko: "현재 진행 중인 대국",
    en: "Matches currently in progress",
  });
  assign("dashboard_stat_streak", {
    kk: "Серия",
    ru: "Серия",
    ko: "연승/연패",
    en: "Streak",
  });
  assign("dashboard_streak_win", {
    kk: "{count} жеңіс қатар",
    ru: "{count} побед подряд",
    ko: "{count}연승",
    en: "{count} wins in a row",
  });
  assign("dashboard_streak_loss", {
    kk: "{count} жеңіліс қатар",
    ru: "{count} поражений подряд",
    ko: "{count}연패",
    en: "{count} losses in a row",
  });
  assign("dashboard_streak_draw", {
    kk: "{count} тең ойын",
    ru: "{count} ничьих",
    ko: "{count}연속 무승부",
    en: "{count} draws",
  });
  assign("dashboard_streak_none", {
    kk: "Серия жоқ",
    ru: "Серии нет",
    ko: "연속 기록 없음",
    en: "No streak yet",
  });
  assign("dashboard_stat_favorite", {
    kk: "Сүйікті түс",
    ru: "Предпочитаемый цвет",
    ko: "선호 색",
    en: "Favorite side",
  });
  assign("dashboard_stat_favorite_hint", {
    kk: "Соңғы ойындарға негізделген",
    ru: "Основано на последних партиях",
    ko: "최근 대국 기준",
    en: "Based on your recent games",
  });
  assign("dashboard_stat_last", {
    kk: "Соңғы партия",
    ru: "Последняя партия",
    ko: "마지막 대국",
    en: "Last match",
  });
  assign("dashboard_stat_last_hint", {
    kk: "Уақыт пен күні",
    ru: "Дата и время",
    ko: "날짜와 시간",
    en: "Date and time",
  });
  assign("dashboard_stat_last_empty", {
    kk: "Әлі ойнамадыңыз",
    ru: "Вы ещё не играли",
    ko: "아직 대국 없음",
    en: "No games yet",
  });
  assign("dashboard_stat_guest", {
    kk: "Қонақ",
    ru: "Гость",
    ko: "게스트",
    en: "Guest",
  });
  assign("dashboard_rank_title", {
    kk: "Рейтинг",
    ru: "Рейтинг",
    ko: "랭크",
    en: "Rank",
  });
  assign("dashboard_rank_unknown", {
    kk: "?",
    ru: "?",
    ko: "?",
    en: "?",
  });
  assign("dashboard_rank_elo", {
    kk: "ELO {elo}",
    ru: "ELO {elo}",
    ko: "ELO {elo}",
    en: "ELO {elo}",
  });
  assign("dashboard_rank_hint", {
    kk: "Жаңа партиялар рейтингіңізді жаңартады.",
    ru: "Новые партии обновят ваш рейтинг.",
    ko: "새 대국이 랭크를 갱신합니다.",
    en: "Fresh games will update your position.",
  });
  assign("dashboard_color_white", {
    kk: "Ақ",
    ru: "Белые",
    ko: "백",
    en: "White",
  });
  assign("dashboard_color_black", {
    kk: "Қара",
    ru: "Чёрные",
    ko: "흑",
    en: "Black",
  });
  assign("dashboard_color_mixed", {
    kk: "Аралас",
    ru: "Смешано",
    ko: "혼합",
    en: "Mixed",
  });
  assign("dashboard_recent_heading", {
    kk: "Соңғы ойындар",
    ru: "Недавние партии",
    ko: "최근 대국",
    en: "Recent matches",
  });
  assign("dashboard_recent_count", {
    kk: "матч",
    ru: "матчей",
    ko: "경기",
    en: "matches",
  });
  assign("dashboard_recent_color", {
    kk: "Сіздің түсіңіз",
    ru: "Ваш цвет",
    ko: "사용자 색",
    en: "Your color",
  });
  assign("dashboard_recent_empty", {
    kk: "Әлі матчтар жоқ. Жаңа партия бастаңыз!",
    ru: "Здесь пока пусто. Запустите новую партию!",
    ko: "아직 경기 기록이 없습니다. 새 대국을 시작해보세요!",
    en: "No matches yet. Start a new game!",
  });
  assign("dashboard_result_win", {
    kk: "Жеңіс",
    ru: "Победа",
    ko: "승리",
    en: "Win",
  });
  assign("dashboard_result_loss", {
    kk: "Жеңіліс",
    ru: "Поражение",
    ko: "패배",
    en: "Loss",
  });
  assign("dashboard_result_draw", {
    kk: "Тең",
    ru: "Ничья",
    ko: "무승부",
    en: "Draw",
  });

  // Store
  assign("store_tagline", {
    kk: "Cherry Economy",
    ru: "Экономика Cherry",
    ko: "체리 이코노미",
    en: "Cherry Economy",
  });
  assign("store_title", {
    kk: "Premium дүкен",
    ru: "Премиум-магазин",
    ko: "프리미엄 스토어",
    en: "Premium Store",
  });
  assign("store_subtitle", {
    kk: "Жүректерді, Cherry Pro жазылымын және визуалды баптауды басқарыңыз.",
    ru: "Управляйте сердцами, подпиской Cherry Pro и визуальными настройками.",
    ko: "하트, Cherry Pro, 비주얼 커스터마이징을 관리하세요.",
    en: "Manage hearts, Cherry Pro access, and premium visual configuration.",
  });

  assign("store_plan_label", {
    kk: "Premium жоспар",
    ru: "Премиум-план",
    ko: "프리미엄 플랜",
    en: "Premium Plan",
  });
  assign("store_plan_text", {
    kk: "Шексіз AI жүректер, визуал баптау және болашақ дыбыс пакеттері.",
    ru: "Бесконечные сердца AI, визуальная кастомизация и будущие звуковые пакеты.",
    ko: "무한 AI 하트, 비주얼 커스터마이징, 향후 사운드 팩.",
    en: "Infinite AI hearts, visual customization, and future premium sound packs.",
  });
  assign("store_status_active", {
    kk: "Cherry Pro белсенді",
    ru: "Cherry Pro активен",
    ko: "Cherry Pro 활성화",
    en: "Cherry Pro active",
  });
  assign("store_status_free", {
    kk: "Тегін деңгей",
    ru: "Бесплатный уровень",
    ko: "무료 티어",
    en: "Free tier",
  });
  assign("store_status_unlimited", {
    kk: "AI режимі шектеусіз.",
    ru: "Режим AI без ограничений.",
    ko: "AI 모드는 무제한입니다.",
    en: "AI mode is unlimited.",
  });
  assign("store_status_next_heart", {
    kk: "Келесі жүрек шамамен {minutes} мин ішінде.",
    ru: "Следующее сердце примерно через {minutes} мин.",
    ko: "다음 하트까지 약 {minutes}분.",
    en: "Next heart in about {minutes} min.",
  });
  assign("store_status_regen", {
    kk: "Жүректер әр 2 сағат сайын қалпына келеді.",
    ru: "Сердца восстанавливаются каждые 2 часа.",
    ko: "하트는 2시간마다 회복됩니다.",
    en: "Hearts regenerate every 2 hours.",
  });
  assign("store_feature_infinite", {
    kk: "Шексіз AI ойындар",
    ru: "Бесконечные игры с AI",
    ko: "무한 AI 대국",
    en: "Infinite AI games",
  });
  assign("store_feature_board", {
    kk: "Тақта түстерін баптау",
    ru: "Кастомные оформления доски",
    ko: "맞춤 보드 색상",
    en: "Custom board skins",
  });
  assign("store_feature_pieces", {
    kk: "Фигура тақырыптары",
    ru: "Темы фигур",
    ko: "맞춤 말 테마",
    en: "Custom piece themes",
  });
  assign("store_button_manage", {
    kk: "Cherry Pro басқару",
    ru: "Управлять Cherry Pro",
    ko: "Cherry Pro 관리",
    en: "Manage Cherry Pro",
  });
  assign("store_button_upgrade", {
    kk: "Cherry Pro-ға көшу",
    ru: "Перейти на Cherry Pro",
    ko: "Cherry Pro로 업그레이드",
    en: "Upgrade to Cherry Pro",
  });
  assign("store_visual_title", {
    kk: "Визуалды терілер",
    ru: "Визуальные темы",
    ko: "비주얼 스킨",
    en: "Visual Skins",
  });
  assign("store_visual_subtitle", {
    kk: "Премиум тақырыптар жергілікті түрде сақталады.",
    ru: "Премиум-настройки сохраняются локально.",
    ko: "프리미엄 구성이 로컬에 저장됩니다.",
    en: "Premium-ready configuration saved locally.",
  });
  assign("store_board_colors", {
    kk: "Тақта түстері",
    ru: "Цвета доски",
    ko: "보드 색상",
    en: "Board Colors",
  });
  assign("store_piece_themes", {
    kk: "Фигура тақырыптары",
    ru: "Темы фигур",
    ko: "말 테마",
    en: "Piece Themes",
  });
  assign("store_board_walnut", {
    kk: "Жаңғақ классикасы",
    ru: "Грецкий классик",
    ko: "호두 클래식",
    en: "Walnut Classic",
  });
  assign("store_board_obsidian", {
    kk: "Түнгі обсидиан",
    ru: "Ночной обсидиан",
    ko: "미드나이트 옵시디언",
    en: "Midnight Obsidian",
  });
  assign("store_board_crimson", {
    kk: "Жарқын шиелі шие",
    ru: "Яркая вишня",
    ko: "비브런트 크림슨 체리",
    en: "Vibrant Crimson Cherry",
  });
  assign("store_piece_minimal", {
    kk: "Минималистік вектор",
    ru: "Минималистичный вектор",
    ko: "미니멀 벡터",
    en: "Minimalist Vector",
  });
  assign("store_piece_metal", {
    kk: "Heavy Metal Metallic",
    ru: "Heavy Metal Metallic",
    ko: "헤비 메탈 메탈릭",
    en: "Heavy Metal Metallic",
  });
  assign("store_piece_retro", {
    kk: "3D ретро",
    ru: "3D Ретро",
    ko: "3D 레트로",
    en: "3D Retro",
  });
  assign("store_piece_geometric", {
    kk: "Геометриялық аниме",
    ru: "Геометрическое аниме",
    ko: "지오메트릭 애니메",
    en: "Geometric Anime",
  });

  // Auth
  assign("auth_welcome_title", {
    kk: "Қайта оралуыңызбен",
    ru: "С возвращением",
    ko: "다시 오신 걸 환영합니다",
    en: "Welcome back",
  });
  assign("auth_welcome_subtitle", {
    kk: "Cherry Chess-тағы партияларды жалғастыру үшін кіріңіз",
    ru: "Войдите, чтобы продолжить партии на Cherry Chess",
    ko: "Cherry Chess에서 진행 중인 대국을 이어가세요",
    en: "Sign in to continue your games on Cherry Chess",
  });
  assign("auth_join_title", {
    kk: "Cherry-ге қосылыңыз",
    ru: "Присоединяйтесь к Cherry",
    ko: "Cherry에 가입하세요",
    en: "Join Cherry",
  });
  assign("auth_join_subtitle", {
    kk: "Тіркеліп, премиум шахмат ойнауды бастаңыз",
    ru: "Создайте аккаунт и начните играть в премиальные шахматы",
    ko: "계정을 만들고 프리미엄 체스를 시작하세요",
    en: "Create your account and start playing premium chess",
  });
  assign("auth_loading_sign_in", {
    kk: "Кіруде...",
    ru: "Входим...",
    ko: "로그인 중...",
    en: "Signing in...",
  });
  assign("auth_loading_sign_up", {
    kk: "Есеп жасау...",
    ru: "Создаём аккаунт...",
    ko: "계정 생성 중...",
    en: "Creating account...",
  });
  assign("auth_sign_in_button", {
    kk: "Кіру",
    ru: "Войти",
    ko: "로그인",
    en: "Sign in",
  });
  assign("auth_sign_up_button", {
    kk: "Есеп жасау",
    ru: "Создать аккаунт",
    ko: "계정 만들기",
    en: "Create account",
  });
  assign("auth_no_account", {
    kk: "Есеп жоқ па?",
    ru: "Нет аккаунта?",
    ko: "계정이 없나요?",
    en: "No account?",
  });
  assign("auth_create_one", {
    kk: "Жасаңыз",
    ru: "Создайте",
    ko: "만드세요",
    en: "Create one",
  });
  assign("auth_have_account", {
    kk: "Есебі бар ма?",
    ru: "Уже есть аккаунт?",
    ko: "이미 계정이 있나요?",
    en: "Already have an account?",
  });
  assign("auth_sign_in_link", {
    kk: "Кіру",
    ru: "Войти",
    ko: "로그인",
    en: "Sign in",
  });
  assign("auth_config_missing", {
    kk: "Аутентификация бапталмаған. Қолдауға жазыңыз.",
    ru: "Аутентификация не настроена. Свяжитесь с поддержкой.",
    ko: "인증이 설정되지 않았습니다. 지원팀에 문의하세요.",
    en: "Authentication is not configured. Contact support.",
  });
  assign("auth_config_failed", {
    kk: "Кіру сәтсіз. Қайта көріңіз.",
    ru: "Войти не удалось. Попробуйте ещё раз.",
    ko: "로그인에 실패했습니다. 다시 시도하세요.",
    en: "Sign-in failed. Please try again.",
  });
  assign("auth_generic_error", {
    kk: "Қате шықты. Кейінірек қайталап көріңіз.",
    ru: "Произошла ошибка. Попробуйте позже.",
    ko: "문제가 발생했습니다. 잠시 후 다시 시도하세요.",
    en: "Something went wrong. Please try again.",
  });
  assign("auth_email_label", {
    kk: "Email",
    ru: "Email",
    ko: "이메일",
    en: "Email",
  });
  assign("auth_email_placeholder", {
    kk: "you@example.com",
    ru: "you@example.com",
    ko: "you@example.com",
    en: "you@example.com",
  });
  assign("auth_password_label", {
    kk: "Құпиясөз",
    ru: "Пароль",
    ko: "비밀번호",
    en: "Password",
  });
  assign("auth_password_placeholder", {
    kk: "••••••••",
    ru: "••••••••",
    ko: "••••••••",
    en: "••••••••",
  });
  assign("auth_password_new_placeholder", {
    kk: "Кемінде 6 таңба",
    ru: "Не менее 6 символов",
    ko: "최소 6자",
    en: "At least 6 characters",
  });
  assign("auth_display_name_label", {
    kk: "Профиль аты",
    ru: "Отображаемое имя",
    ko: "표시 이름",
    en: "Display name",
  });
  assign("auth_display_name_placeholder", {
    kk: "Атыңыз",
    ru: "Ваше имя",
    ko: "이름",
    en: "Your name",
  });
  assign("auth_check_email_title", {
    kk: "Почтаңызды тексеріңіз",
    ru: "Проверьте почту",
    ko: "이메일을 확인하세요",
    en: "Check your email",
  });
  assign("auth_check_email_body", {
    kk: "{email} поштасына сілтеме жібердік. Аккаунтты белсендіріп, кіріңіз.",
    ru: "Мы отправили ссылку на {email}. Активируйте аккаунт и войдите.",
    ko: "{email} 주소로 확인 링크를 보냈습니다. 계정을 활성화하고 로그인하세요.",
    en: "We sent a verification link to {email}. Open it to activate your account, then sign in to play.",
  });
  assign("auth_back_to_sign_in", {
    kk: "Кіруге оралу",
    ru: "Вернуться к входу",
    ko: "로그인으로 돌아가기",
    en: "Back to sign in",
  });

  // Local chess
  assign("local_check_label", {
    kk: "Шах!",
    ru: "Шах!",
    ko: "체크!",
    en: "Check!",
  });
  assign("local_checkmate_label", {
    kk: "Мат",
    ru: "Мат",
    ko: "체크메이트",
    en: "Checkmate",
  });
  assign("local_stalemate_label", {
    kk: "Пат",
    ru: "Пат",
    ko: "스테일메이트",
    en: "Stalemate",
  });
  assign("local_theme_light", {
    kk: "Жарық тақырыпты қолдану",
    ru: "Использовать светлую тему",
    ko: "라이트 테마 사용",
    en: "Use light theme",
  });
  assign("local_theme_dark", {
    kk: "Қараңғы тақырыпты қолдану",
    ru: "Использовать тёмную тему",
    ko: "다크 테마 사용",
    en: "Use dark theme",
  });
  assign("local_ai_title", {
    kk: "AI-ға қарсы ойнау",
    ru: "Игра против AI",
    ko: "AI와 대국",
    en: "Play vs AI",
  });
  assign("local_ai_meta", {
    kk: "Stockfish {label} • Тереңдігі {depth}",
    ru: "Stockfish {label} • Глубина {depth}",
    ko: "Stockfish {label} • 깊이 {depth}",
    en: "Stockfish {label} • Depth {depth}",
  });
  assign("local_difficulty_label", {
    kk: "Қиындық",
    ru: "Сложность",
    ko: "난이도",
    en: "Difficulty",
  });
  assign("local_engine_label", {
    kk: "Қозғалтқыш",
    ru: "Движок",
    ko: "엔진",
    en: "Engine",
  });
  assign("local_engine_unavailable", {
    kk: "Қозғалтқыш қолжетімсіз",
    ru: "Движок недоступен",
    ko: "엔진을 사용할 수 없음",
    en: "Engine unavailable",
  });
  assign("local_engine_thinking", {
    kk: "Ойлануда...",
    ru: "Думает...",
    ko: "생각 중...",
    en: "Thinking...",
  });
  assign("local_engine_loading", {
    kk: "Қозғалтқыш жүктелуде...",
    ru: "Загружаем движок...",
    ko: "엔진 로딩 중...",
    en: "Loading engine...",
  });
  assign("local_engine_level", {
    kk: "Деңгей {level}",
    ru: "Уровень {level}",
    ko: "레벨 {level}",
    en: "Level {level}",
  });
  assign("local_side_black", {
    kk: "Қара",
    ru: "Чёрные",
    ko: "흑",
    en: "Black",
  });
  assign("local_side_white", {
    kk: "Ақ",
    ru: "Белые",
    ko: "백",
    en: "White",
  });
  assign("local_ai_label", {
    kk: "AI",
    ru: "AI",
    ko: "AI",
    en: "AI",
  });
  assign("local_ai_name", {
    kk: "Magnus (AI)",
    ru: "Magnus (AI)",
    ko: "Magnus (AI)",
    en: "Magnus (AI)",
  });
  assign("local_choose_promotion", {
    kk: "Айырбастау фигурасын таңдаңыз",
    ru: "Выберите фигуру для превращения",
    ko: "승진할 말을 선택하세요",
    en: "Choose promotion",
  });
  assign("local_promotion_queen", {
    kk: "Ферзь",
    ru: "Ферзь",
    ko: "퀸",
    en: "Queen",
  });
  assign("local_promotion_rook", {
    kk: "Тура",
    ru: "Ладья",
    ko: "룩",
    en: "Rook",
  });
  assign("local_promotion_bishop", {
    kk: "Піл",
    ru: "Слон",
    ko: "비숍",
    en: "Bishop",
  });
  assign("local_promotion_knight", {
    kk: "Ат",
    ru: "Конь",
    ko: "나이트",
    en: "Knight",
  });
  assign("local_you_initials", {
    kk: "СІ",
    ru: "ВЫ",
    ko: "YOU",
    en: "YOU",
  });
  assign("local_you_name", {
    kk: "Сіз",
    ru: "Вы",
    ko: "당신",
    en: "You",
  });
  assign("local_your_turn", {
    kk: "Сіздің кезегіңіз",
    ru: "Ваш ход",
    ko: "당신의 차례",
    en: "Your turn",
  });
  assign("local_waiting", {
    kk: "Күту...",
    ru: "Ожидание...",
    ko: "대기 중...",
    en: "Waiting...",
  });
  assign("local_new_game", {
    kk: "Жаңа партия",
    ru: "Новая партия",
    ko: "새 대국",
    en: "New Game",
  });
  assign("local_move_history", {
    kk: "Жүріс тарихы",
    ru: "История ходов",
    ko: "기보",
    en: "Move History",
  });
  assign("local_game_over_title", {
    kk: "Партия аяқталды",
    ru: "Партия завершена",
    ko: "대국 종료",
    en: "Game Over",
  });
  assign("local_game_over_subtitle", {
    kk: "Жақсы ойнадыңыз.",
    ru: "Отличная партия.",
    ko: "수고하셨습니다.",
    en: "Well played.",
  });
  assign("local_game_over_checkmate_subtitle", {
    kk: "{winner} жеңді!",
    ru: "{winner} победили!",
    ko: "{winner} 승리!",
    en: "{winner} wins!",
  });
  assign("local_game_over_stalemate_subtitle", {
    kk: "Партия тең аяқталды.",
    ru: "Партия завершилась вничью.",
    ko: "대국이 무승부로 끝났습니다.",
    en: "The game is drawn.",
  });
  assign("local_game_over_draw_subtitle", {
    kk: "Партия тең аяқталды.",
    ru: "Партия завершилась вничью.",
    ko: "대국이 무승부로 끝났습니다.",
    en: "The game ended in a draw.",
  });
  assign("local_game_over_resigned_title", {
    kk: "Берілу",
    ru: "Сдача",
    ko: "기권",
    en: "Resigned",
  });
  assign("local_game_over_resigned_subtitle", {
    kk: "Сіз партиядан бас тарттыңыз.",
    ru: "Вы сдались в партии.",
    ko: "대국을 기권했습니다.",
    en: "You resigned the game.",
  });
  assign("local_game_over_draw_offer_subtitle", {
    kk: "Партия келісім бойынша тең аяқталды.",
    ru: "Партия завершилась ничьей по соглашению.",
    ko: "합의에 따라 무승부가 되었습니다.",
    en: "Game drawn by agreement.",
  });

  // Profile
  assign("profile_tagline", {
    kk: "Cherry Identity",
    ru: "Cherry Identity",
    ko: "체리 아이덴티티",
    en: "Cherry Identity",
  });
  assign("profile_title", {
    kk: "Профиль",
    ru: "Профиль",
    ko: "프로필",
    en: "Profile",
  });
  assign("profile_subtitle", {
    kk: "Жария шахматтық бейнеңізді, аватарды, қауіпсіздікті және прогресті басқарыңыз.",
    ru: "Управляйте публичным шахматным профилем, аватаром, безопасностью и прогрессом.",
    ko: "공개 체스 프로필, 아바타, 보안, 진행 상황을 관리하세요.",
    en: "Manage your public chess identity, avatar, security, and progress.",
  });
  assign("profile_avatar_label", {
    kk: "Аватар",
    ru: "Аватар",
    ko: "아바타",
    en: "Avatar",
  });
  assign("profile_avatar_uploading", {
    kk: "Жүктелуде",
    ru: "Загрузка",
    ko: "업로드 중",
    en: "Uploading",
  });
  assign("profile_management_title", {
    kk: "Профильді басқару",
    ru: "Управление профилем",
    ko: "프로필 관리",
    en: "Profile Management",
  });
  assign("profile_management_subtitle", {
    kk: "Жария Cherry Chess профиліңізді және орналасуыңызды жаңартыңыз.",
    ru: "Обновляйте публичный профиль Cherry Chess и местоположение.",
    ko: "Cherry Chess 공개 프로필과 위치를 업데이트하세요.",
    en: "Update your public Cherry Chess identity and location.",
  });
  assign("profile_username_label", {
    kk: "Пайдаланушы аты",
    ru: "Имя пользователя",
    ko: "사용자 이름",
    en: "Username",
  });
  assign("profile_username_placeholder", {
    kk: "CherryMaster",
    ru: "CherryMaster",
    ko: "CherryMaster",
    en: "CherryMaster",
  });
  assign("profile_country_label", {
    kk: "Ел",
    ru: "Страна",
    ko: "국가",
    en: "Country",
  });
  assign("profile_country_placeholder", {
    kk: "Қазақстан",
    ru: "Казахстан",
    ko: "Kazakhstan",
    en: "Kazakhstan",
  });
  assign("profile_city_label", {
    kk: "Қала",
    ru: "Город",
    ko: "도시",
    en: "City",
  });
  assign("profile_city_placeholder", {
    kk: "Алматы",
    ru: "Алматы",
    ko: "알마티",
    en: "Almaty",
  });
  assign("profile_bio_label", {
    kk: "Био",
    ru: "Био",
    ko: "소개",
    en: "Bio",
  });
  assign("profile_bio_placeholder", {
    kk: "Сабырлы стратегпін, эндшпильді ұнатамын.",
    ru: "Спокойный позиционный игрок с любовью к эндшпилям.",
    ko: "엔드게임을 좋아하는 침착한 포지셔널 플레이어.",
    en: "A calm positional player with a taste for endgames.",
  });
  assign("profile_save_button", {
    kk: "Профильді сақтау",
    ru: "Сохранить профиль",
    ko: "프로필 저장",
    en: "Save profile",
  });
  assign("profile_stats_title", {
    kk: "Жетістіктер және статистика",
    ru: "Достижения и статистика",
    ko: "업적 및 통계",
    en: "Achievements & Stats",
  });
  assign("profile_elo_label", {
    kk: "ELO",
    ru: "ELO",
    ko: "ELO",
    en: "ELO",
  });
  assign("profile_wl_label", {
    kk: "Ж/Ж",
    ru: "П/П",
    ko: "승/패",
    en: "W/L",
  });
  assign("profile_winrate_label", {
    kk: "Жеңіс %",
    ru: "Win%",
    ko: "승률",
    en: "Win%",
  });
  assign("profile_badges_title", {
    kk: "Белгілер",
    ru: "Значки",
    ko: "배지",
    en: "Badges",
  });
  assign("profile_badge_first_win", {
    kk: "Алғашқы жеңіс",
    ru: "Первая победа",
    ko: "첫 승",
    en: "First Win",
  });
  assign("profile_badge_streak", {
    kk: "Cherry сериясы",
    ru: "Cherry серия",
    ko: "체리 연승",
    en: "Cherry Streak",
  });
  assign("profile_badge_city", {
    kk: "Қала жеңімпазы",
    ru: "Городской клaймер",
    ko: "시티 클라이머",
    en: "City Climber",
  });
  assign("profile_badge_pro", {
    kk: "Про стратег",
    ru: "Про стратег",
    ko: "프로 전략가",
    en: "Pro Strategist",
  });
  assign("profile_badge_unlocked", {
    kk: "Ашылды",
    ru: "Открыто",
    ko: "해금",
    en: "Unlocked",
  });
  assign("profile_badge_locked", {
    kk: "Құлыптаулы",
    ru: "Заблокировано",
    ko: "잠김",
    en: "Locked",
  });
  assign("profile_security_title", {
    kk: "Қауіпсіздік",
    ru: "Безопасность",
    ko: "보안",
    en: "Security",
  });
  assign("profile_security_subtitle", {
    kk: "Құпиясөзді қалпына келтіру поштасына сілтеме жібере аласыз.",
    ru: "Отправьте письмо для сброса пароля.",
    ko: "비밀번호 재설정 이메일을 보냅니다.",
    en: "Send a password reset email.",
  });
  assign("profile_reset_password", {
    kk: "Құпиясөзді қалпына келтіру",
    ru: "Сбросить пароль",
    ko: "비밀번호 재설정",
    en: "Reset password",
  });

  return catalogue;
}

export const messages = buildMessages();

export type MessageKey = keyof typeof messages.kk;
