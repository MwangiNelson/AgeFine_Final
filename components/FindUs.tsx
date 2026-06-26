import { SITE, whatsappLink, mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/site";

/**
 * "Find us" block: the clinic's real location (Imaara Shopping Mall, 2nd Floor,
 * Mombasa Road) with an embedded map and one-tap directions / call /
 * WhatsApp actions. Used on the home and contact pages.
 */
export default function FindUs({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-[1fr_1.2fr]"} gap-8 lg:gap-12 items-stretch`}>
      {/* Details */}
      <div className="flex flex-col">
        <h3 className="font-serif text-plum text-2xl md:text-3xl mt-0 mb-4">Visit the clinic</h3>
        <address className="not-italic font-sans font-light text-plum-soft text-[15px] leading-relaxed m-0">
          <strong className="font-normal text-plum">{SITE.name}</strong>
          <br />
          {SITE.address.streetAddress}
          <br />
          {SITE.address.locality}, Kenya
        </address>

        <dl className="m-0 mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-sans text-[14px]">
          <dt className="text-plum-soft">Hours</dt>
          <dd className="m-0 text-plum">{SITE.openingHoursHuman}</dd>
          <dt className="text-plum-soft">Clinic</dt>
          <dd className="m-0">
            <a href={`tel:${SITE.phone}`} className="text-plum no-underline hover:text-rose transition-colors">
              {SITE.phone.replace("+254", "0")}
            </a>
          </dd>
          <dt className="text-plum-soft">Bookings</dt>
          <dd className="m-0">
            <a href={`tel:${SITE.bookingPhone}`} className="text-plum no-underline hover:text-rose transition-colors">
              {SITE.bookingPhone.replace("+254", "0")}
            </a>
          </dd>
        </dl>

        <div className="flex flex-wrap gap-3 mt-6">
          <a href={mapsDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
            </svg>
            Get directions
          </a>
          <a href={whatsappLink("Hi Agefine, I'd like to book a treatment.")} className="btn btn-outline">
            WhatsApp us
          </a>
        </div>

        <p className="font-sans text-[12.5px] text-plum-soft leading-relaxed mt-5 mb-0">
          Find us on the 2nd floor of Imaara Shopping Mall, along Mombasa Road — easy parking,
          and a short ride from Imara Daima station.
        </p>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border min-h-[280px]" style={{ borderColor: "var(--line)" }}>
        <iframe
          title={`Map showing ${SITE.name} at Imaara Shopping Mall, Mombasa Road, Nairobi`}
          src={mapsEmbedUrl()}
          className="w-full h-full min-h-[280px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
