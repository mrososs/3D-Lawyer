import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, FormEvent, ReactNode } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpLeft, Building2, Check, ChevronDown, FilePenLine, Landmark, Menu, Scale, ShieldCheck, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneMotion } from './motion'

gsap.registerPlugin(ScrollTrigger)
const JusticeScene = lazy(() => import('./JusticeScene'))
const links = [['الرئيسية', '#home'], ['من نحن', '#about'], ['مجالات الممارسة', '#practice'], ['نهجنا', '#approach'], ['تواصل معنا', '#contact']]
const practices = [
  { title: 'القضايا التجارية', icon: Landmark, text: 'رؤية قانونية تحمي أعمالك، من تأسيس الشراكات إلى إدارة النزاعات التجارية.', detail: 'فهم طبيعة النشاط، ومراجعة المستندات، وتقييم الخيارات النظامية لبناء مسار واضح للنزاع التجاري.' },
  { title: 'التحكيم وتسوية النزاعات', icon: Scale, text: 'حلول مدروسة تتجاوز الخلاف، وتحفظ قيمة العلاقات والمصالح.', detail: 'دراسة اتفاق التحكيم، وتحديد فرص التسوية، وإعداد استراتيجية تفاوض تراعي الوقت والتكلفة والمصلحة.' },
  { title: 'العقود والاتفاقيات', icon: FilePenLine, text: 'صياغة دقيقة تجعل التزامات اليوم أساسًا مطمئنًا للغد.', detail: 'صياغة ومراجعة العقود، وتحليل الالتزامات والمخاطر، وضبط بنود الإنهاء والسرية وتسوية المنازعات.' },
  { title: 'القضايا العقارية', icon: Building2, text: 'عناية بالتفاصيل التي تحمي ملكيتك وتدعم استقرار استثماراتك.', detail: 'مراجعة مستندات الملكية وعقود البيع والإيجار، وتقييم الموقف القانوني في المنازعات العقارية.' },
  { title: 'حوكمة الشركات', icon: ShieldCheck, text: 'أطر واضحة للمسؤولية، وقرارات مؤسسية أكثر اتزانًا وشفافية.', detail: 'تنظيم العلاقة بين الشركاء، ومراجعة سياسات الصلاحيات والامتثال، وتوثيق القرارات المؤسسية.' },
  { title: 'الاستشارات القانونية', icon: Landmark, text: 'رأي قانوني يضع الصورة كاملة أمامك، لتختار خطوتك بثقة.', detail: 'تحليل المسألة في سياقها، وتوضيح البدائل وآثارها، وتقديم توصيات قابلة للتطبيق وفق المعطيات المتاحة.' },
]

function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="#home" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="رِواق — العودة للرئيسية"><svg className="brand-mark" viewBox="0 0 40 54" fill="none" aria-hidden="true"><path d="M5 49V22a15 15 0 0 1 30 0v27M11 49V22a9 9 0 0 1 18 0v27M17 49V22a3 3 0 0 1 6 0v27M1 49h38M20 7V1" stroke="currentColor" strokeWidth="1.25" /></svg><span className="brand-text"><strong>رِواق</strong><span>للمحاماة والاستشارات القانونية</span></span></a>
}

function ScenePlaceholder({ error = false }: { error?: boolean }) {
  return <div className="scene-placeholder" role="status"><Scale size={72} strokeWidth={0.8} /><span>{error ? 'التوازن أساس كل قرار.' : 'تتشكّل الرؤية…'}</span>{error && <small>العرض ثلاثي الأبعاد غير متاح في هذا المتصفح.</small>}</div>
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('3D fallback:', error.message, info.componentStack) }
  render() { return this.state.failed ? <ScenePlaceholder error /> : this.props.children }
}

function Scene({ variant, reduced }: { variant: 'hero' | 'feature'; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(variant === 'hero')
  const [loaded, setLoaded] = useState(variant === 'hero')
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); if (entry.isIntersecting) setLoaded(true) }, { rootMargin: '120px' })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`scene scene-${variant}`} role="img" aria-label="منحوتة تفاعلية ثلاثية الأبعاد لميزان العدالة الذهبي على قاعدة حجرية"><SceneBoundary><Suspense fallback={<ScenePlaceholder />}>{loaded && <JusticeScene variant={variant} active={visible} reduced={reduced} />}</Suspense></SceneBoundary></div>
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    const onScroll = () => setScrolled(window.scrollY > 30)
    media.addEventListener('change', onChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { media.removeEventListener('change', onChange); window.removeEventListener('scroll', onScroll) }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [expanded, submitted, errors])

  useEffect(() => {
    let mounted = true
    void document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const context = gsap.context(() => {
      if (reduced) { sceneMotion.entrance = 1; sceneMotion.hero = 0; sceneMotion.feature = 0; return }
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.site-header', { y: -20, opacity: 0, duration: 0.9 })
        .from('.hero-reveal', { y: 38, opacity: 0, duration: 1.15, stagger: 0.13 }, 0.2)
        .fromTo(sceneMotion, { entrance: 0 }, { entrance: 1, duration: 2.3 }, 0.2)
        .from('.hero-foot', { opacity: 0, duration: 1 }, 1.3)
      gsap.to(sceneMotion, { hero: 1, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to(sceneMotion, { feature: 1, ease: 'none', scrollTrigger: { trigger: '#perspective', start: 'top bottom', end: 'bottom top', scrub: 1.4 } })
      gsap.to('.orbit-outer', { rotation: 110, ease: 'none', scrollTrigger: { trigger: '#perspective', start: 'top bottom', end: 'bottom top', scrub: 1 } })
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => gsap.from(element, { y: 32, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } }))
      gsap.from('.approach-line', { scaleX: 0, transformOrigin: 'right', ease: 'none', scrollTrigger: { trigger: '#approach', start: 'top 75%', end: 'center 45%', scrub: 0.6 } })
    }, root)
    return () => context.revert()
  }, [reduced])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next: Record<string, string> = {}
    if (String(data.get('name') ?? '').trim().length < 2) next.name = 'يرجى إدخال اسمك (حرفين على الأقل).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get('email') ?? '').trim())) next.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    if (!data.get('practice')) next.practice = 'يرجى اختيار مجال الاستشارة.'
    if (String(data.get('message') ?? '').trim().length < 10) next.message = 'يرجى كتابة نبذة لا تقل عن ١٠ أحرف.'
    setErrors(next)
    if (Object.keys(next).length) { event.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return }
    setSubmitted(true)
  }

  return <div ref={root}>
    <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
    <header className={`site-header ${scrolled || menuOpen ? 'solid' : ''}`}>
      <div className="header-inner"><Brand /><nav className="desktop-nav" aria-label="التنقل الرئيسي">{links.map(([label, href], i) => <a className={i === 0 ? 'nav-home' : ''} key={href} href={href}>{label}</a>)}</nav><a className="header-cta" href="#contact">احجز استشارة <ArrowUpLeft size={15} /></a><button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      {menuOpen && <nav className="mobile-nav" id="mobile-nav" aria-label="القائمة المحمولة">{links.map(([label, href], i) => <a href={href} key={href} onClick={() => setMenuOpen(false)}><span>{label}</span><small>0{i + 1}</small></a>)}<a href="#contact" onClick={() => setMenuOpen(false)}>احجز استشارة <ArrowUpLeft size={20} /></a></nav>}
    </header>

    <main id="main">
      <section className="hero" id="home">
        <div className="hero-architecture" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-copy">
          <p className="eyebrow hero-reveal"><span className="gold-dash" /> رِواق للمحاماة والاستشارات القانونية</p>
          <h1><span className="headline-line hero-reveal">حين تكون العدالة</span><span className="headline-line gold hero-reveal">مسألة إتقان<span className="headline-dot">.</span></span></h1>
          <p className="hero-description hero-reveal">خبرة قانونية راسخة، ورؤية معاصرة لحماية مصالحك<br className="desktop-break" /> وصناعة قرارات أكثر ثقة.</p>
          <div className="hero-actions hero-reveal"><a className="button button-gold" href="#practice">اكتشف خبراتنا <ArrowLeft size={19} /></a><a className="button button-text" href="#contact">احجز استشارة <ArrowUpLeft size={18} /></a></div>
          <div className="hero-signature hero-reveal"><span /> وضوح في الرؤية. إتقان في الممارسة.</div>
        </div>
        <Scene variant="hero" reduced={reduced} />
        <div className="sculpture-caption" aria-hidden="true"><span>التوازن. مبدأ لا يتغيّر.</span><span lang="en" dir="ltr">THE ART OF BALANCE — RIWAQ</span></div>
        <div className="hero-foot"><a href="#about" className="scroll-cue"><span className="scroll-capsule"><ArrowDown size={15} /></span> تمرّر لتكتشف رِواق</a><span className="hero-index" dir="ltr"><b>01</b><span />08</span><span className="hero-foot-label" lang="en">BUILT ON TRUST. DEFINED BY PRECISION.</span></div>
      </section>

      <div className="principles-strip" aria-label="قيم رِواق"><span>خبرة تتعمّق.</span><span className="diamond">✧</span><span>رؤية تتّسع.</span><span className="diamond">✧</span><span>ثقة تدوم.</span><span className="strip-english" lang="en" dir="ltr">A HIGHER STANDARD OF LEGAL THINKING</span></div>

      <section className="section about" id="about"><div className="section-kicker reveal"><span>01 / فلسفتنا</span><span className="tiny-label" lang="en">THE RIWAQ PERSPECTIVE</span></div><div className="about-grid"><div className="reveal"><h2>الخبرة تصنع<br /><span className="gold">الفارق.</span></h2><div className="architecture-emblem" aria-hidden="true"><i /><i /><i /><span>ر</span></div></div><div className="about-copy reveal"><p className="large-copy">لا نكتفي بقراءة النصوص.<br />نقرأ ما وراءها من فرص وتحدّيات.</p><p>في رِواق، نؤمن أن الممارسة القانونية المتقنة تبدأ بالإنصات. نفهم تفاصيل كل قضية في سياقها الأوسع، ونربط المعرفة القانونية برؤية عملية تضع مصالحك في صميم كل خطوة.</p><p>علاقة تتأسس على الوضوح، وعمل تحكمه الدقة، والتزام بأن تجد أمامك الصورة كاملة قبل أن تتخذ قرارك.</p><a className="inline-link" href="#approach">تعرّف على نهجنا <ArrowLeft size={18} /></a><div className="values"><span><Check size={14} /> استقلالية الرأي</span><span><Check size={14} /> سرّية تامة</span><span><Check size={14} /> عناية بالتفاصيل</span></div></div></div></section>

      <section className="section practice" id="practice"><div className="section-kicker reveal"><span>02 / مجالات الممارسة</span><span className="tiny-label" lang="en">EXPERTISE WITH PURPOSE</span></div><div className="section-heading reveal"><h2>معرفة واسعة.<br /><span className="muted">عناية متخصّصة.</span></h2><p>لكل تحدٍّ مساره القانوني.<br />ولكل مسار، خبرة تُحسن قيادته.</p></div><div className="practice-grid">{practices.map((practice, index) => <article key={practice.title} className={`practice-item reveal ${expanded === index ? 'expanded' : ''}`}><button className="practice-button" aria-expanded={expanded === index} aria-controls={`practice-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}><span className="practice-top"><practice.icon size={31} strokeWidth={1} /><span className="number">0{index + 1}</span></span><h3>{practice.title}</h3><p>{practice.text}</p><span className="practice-bottom"><span>{expanded === index ? 'إغلاق التفاصيل' : 'استكشف المجال'}</span><ArrowUpLeft size={20} /></span></button><div className="practice-detail" id={`practice-${index}`} hidden={expanded !== index}><p>{practice.detail}</p><a href="#contact" className="inline-link">ناقش احتياجك معنا <ArrowLeft size={16} /></a></div></article>)}</div></section>

      <section className="perspective" id="perspective"><div className="perspective-orbits" aria-hidden="true"><div className="orbit-outer"><i /><i /></div><div className="orbit-inner" /></div><Scene variant="feature" reduced={reduced} /><div className="perspective-copy reveal"><p className="eyebrow"><span className="gold-dash" /> 03 / منظور أبعد</p><h2>لكل قضية أبعادها.<br /><span className="gold">ولكل قرار أثره.</span></h2><p>نرى التفاصيل التي تصنع الصورة الكاملة.<br />ونوازن الاحتمالات لنمنح كل خطوة معناها.</p><a className="circle-link" href="#approach" aria-label="اكتشف نهجنا"><ArrowDown size={22} /></a></div><span className="perspective-note" lang="en" dir="ltr">PERSPECTIVE CHANGES EVERYTHING.</span></section>

      <section className="section approach" id="approach"><div className="section-kicker reveal"><span>04 / نهجنا</span><span className="tiny-label" lang="en">CLARITY AT EVERY STEP</span></div><div className="section-heading reveal"><h2>خطوات واضحة.<br /><span className="muted">وجهة واحدة: مصلحتك.</span></h2><p>من أول حديث، إلى آخر تفصيل.<br />شراكة قانونية تعرف أين تمضي.</p></div><div className="approach-stages"><div className="approach-line" />{[['نفهم التفاصيل', 'نستمع، نسأل، ونحلّل. نمنح كل تفصيل حقه لنصل إلى فهم عميق لاحتياجك وأهدافك.'], ['نبني الاستراتيجية', 'نرسم المسارات الممكنة، ونقيّم المخاطر، ونضع معك خطة قانونية واضحة وقابلة للتنفيذ.'], ['ندافع عن مصالحك', 'نحوّل الاستراتيجية إلى عمل دقيق، ونتابع كل مستجد، ونبقيك على اطلاع في كل مرحلة.']].map(([title, text], i) => <div className="stage reveal" key={title}><span className="stage-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>

      <section className="quote-section"><div className="quote-mark reveal" aria-hidden="true">“</div><blockquote className="reveal">القانون ليس مجرد نصوص،<br />بل <span>مسؤولية وثقة ورؤية.</span></blockquote><div className="quote-credit reveal"><span /> مبدأ رِواق <span /></div></section>

      <section className="section contact" id="contact"><div className="section-kicker reveal"><span>05 / تواصل معنا</span><span className="tiny-label" lang="en">LET’S START A CONVERSATION</span></div><div className="contact-grid"><div className="contact-copy reveal"><h2>دعنا نبدأ<br />من حيث تبدأ<br /><span className="gold">الثقة.</span></h2><p>كل علاقة ناجحة تبدأ بحوار.<br />شاركنا نبذة عن احتياجك، ولنرسم الخطوة الأولى.</p><div className="demo-note"><span className="demo-dot" /><p>تجربة توضيحية<br /><span>رِواق علامة افتراضية. هذا النموذج للعرض فقط؛ لا تُرسل البيانات أو تُحفظ. يرجى عدم مشاركة معلومات حساسة.</span></p></div></div><div className="form-wrap reveal">{submitted ? <div className="success-panel" role="status" tabIndex={-1} ref={element => element?.focus()}><span className="success-icon"><Check size={30} /></span><p className="eyebrow">اكتملت التجربة</p><h3>شكرًا لمنحنا ثقتك.</h3><p>تم التحقق من بيانات النموذج محليًا بنجاح. هذا عرض توضيحي؛ لم تُرسل أي رسالة، ولم تُحفظ بياناتك أو يُحجز موعد.</p><button className="inline-link" onClick={() => { setSubmitted(false); setErrors({}) }}>تجربة النموذج من جديد <ArrowLeft size={17} /></button></div> : <form noValidate onSubmit={submit}><div className="form-field"><label htmlFor="name">الاسم الكامل <span>*</span></label><input id="name" name="name" autoComplete="name" placeholder="كيف نُناديك؟" required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <small className="field-error" id="name-error">{errors.name}</small>}</div><div className="form-field"><label htmlFor="email">البريد الإلكتروني <span>*</span></label><input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" dir="ltr" required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <small className="field-error" id="email-error">{errors.email}</small>}</div><div className="form-field"><label htmlFor="practice-field">مجال الاستشارة <span>*</span></label><div className="select-wrap"><select id="practice-field" name="practice" required defaultValue="" aria-invalid={!!errors.practice} aria-describedby={errors.practice ? 'practice-error' : undefined}><option value="" disabled>اختر المجال المناسب</option>{practices.map(p => <option key={p.title}>{p.title}</option>)}<option>استفسار آخر</option></select><ChevronDown size={17} /></div>{errors.practice && <small className="field-error" id="practice-error">{errors.practice}</small>}</div><div className="form-field"><label htmlFor="message">كيف يمكننا مساعدتك؟ <span>*</span></label><textarea id="message" name="message" rows={3} required minLength={10} placeholder="نبذة موجزة عن موضوع الاستشارة…" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <small className="field-error" id="message-error">{errors.message}</small>}</div><button type="submit" className="button button-gold submit-button">جرّب طلب الاستشارة <ArrowUpLeft size={21} /></button><p className="form-caption"><ShieldCheck size={14} /> عرض تجريبي — لا يتم إرسال أي بيانات.</p></form>}</div></div></section>
    </main>
    <footer className="footer"><div className="footer-main"><Brand footer /><p>حيث تلتقي المعرفة بالدقة.<br />وتبدأ الثقة.</p><a className="back-top" href="#home">إلى الأعلى <ArrowUpLeft size={19} /></a></div><nav className="footer-nav" aria-label="روابط التذييل">{links.slice(1).map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav><div className="footer-bottom"><span>© {new Date().getFullYear()} رِواق. نموذج تصوّري لعلامة افتراضية.</span><span lang="en" dir="ltr">RIWAQ — LAW, WITH PERSPECTIVE.</span></div></footer>
  </div>
}

export default App
