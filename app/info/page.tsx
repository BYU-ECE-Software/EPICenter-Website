"use client";

import { useMemo, useState } from "react";
import {
  FiClock,
  FiBookOpen,
  FiTool,
  FiCreditCard,
  FiCalendar,
  FiRepeat,
  FiAlertTriangle,
} from "react-icons/fi";

type TabKey = "shopResources" | "epicenterPolicies" | "locationHoursContact";

function TabButton({
  active,
  label,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition",
        active
          ? "bg-byu-navy text-white shadow-sm"
          : "bg-white text-byu-navy border border-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-left">{label}</span>
    </button>
  );
}

function ResourceSection({
  title,
  body,
  imageLabel,
  imageSrc,
  reverse,
}: {
  title: string;
  body: string;
  imageLabel: string;
  imageSrc?: string;
  reverse?: boolean;
}) {
  return (
    <section
      className={[
        "grid items-center gap-6 rounded-2xl border border-byu-navy/30 bg-white p-6 shadow-sm",
        "lg:grid-cols-12",
      ].join(" ")}
    >
      {/* Image block */}
      <div
        className={[
          "lg:col-span-4", // ✅ narrower image column (less wide)
          reverse ? "lg:order-2" : "lg:order-1",
        ].join(" ")}
      >
        <div className="relative">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-byu-navy/50" />
          <div className="relative overflow-hidden rounded-2xl border-2 border-byu-navy bg-gray-100">
            <img
              src={imageSrc}
              alt={imageLabel}
              className="h-56 sm:h-64 lg:h-72 w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Text block */}
      <div
        className={[
          "lg:col-span-8",
          reverse ? "lg:order-1" : "lg:order-2",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 ml-3 mr-2">
            <h2 className="text-3xl font-bold text-byu-navy mb-6">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PoliciesContent() {
  return (
    <div className="space-y-6">
      {/* Purchases */}
      <div className="overflow-hidden rounded-2xl border border-byu-navy/20 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-byu-royal/10 text-byu-royal">
              <FiCreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-byu-navy">Purchases</h2>
              <p className="text-xs text-gray-500">Payment methods</p>
            </div>
          </div>

          <span className="rounded-full bg-byu-navy/5 px-3 py-1 text-xs font-semibold text-byu-navy">
            EPICenter policy
          </span>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">
            Cougar Cash, department card, or research group only.
          </p>
        </div>
      </div>

      {/* Loans */}
      <div className="overflow-hidden rounded-2xl border border-byu-navy/20 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-byu-royal/10 text-byu-royal">
              <FiCalendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-byu-navy">Loans</h2>
              <p className="text-xs text-gray-500">
                Standard checkout duration
              </p>
            </div>
          </div>

          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            No charge
          </span>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">
            10 day or end of semester duration, no charge.
          </p>
        </div>
      </div>

      {/* Inter-departmental Loans (featured) */}
      <div className="relative overflow-hidden rounded-2xl border border-byu-navy/25 bg-white shadow-sm">
        {/* subtle accent strip */}
        <div className="absolute left-0 top-0 h-full w-2 bg-byu-navy" />

        <div className="border-b border-gray-100 px-6 py-5 pl-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-byu-navy/10 text-byu-navy">
                <FiRepeat className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-byu-navy">
                  Inter-departmental Loans
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  ECEn equipment check-outs to other departments
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-byu-navy/20 bg-byu-navy/5 px-3 py-2">
              <FiAlertTriangle className="h-4 w-4 text-byu-navy" />
              <span className="text-xs font-semibold text-byu-navy">
                Fees may apply
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 pl-7 space-y-4">
          {/* Key rule highlight */}
          <div className="rounded-xl border border-byu-navy/20 bg-gray-50 p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              All ECEn equipment check-outs to other department(s) will be
              limited to a duration of{" "}
              <span className="font-semibold text-byu-navy">one semester</span>{" "}
              free of charge, after which a rental fee of{" "}
              <span className="font-semibold text-byu-navy">3%</span> of the
              value of the equipment will be charged{" "}
              <span className="font-semibold text-byu-navy">each month</span>.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Equipment requested by other departments will only be checked out
              to faculty within those departments (e.g., the faculty leader of a
              Capstone project). This will help ensure that equipment is not
              lost as groups change and seniors graduate.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed">
              Our intent is not to hinder your activities, but rather to
              encourage those who need equipment to look first within their own
              department, then to the EPICenter for short-term checkout only.
              The purpose of the rental fee is to cover the cost of overhead,
              replacement and repairs that inevitably arise as equipment is
              used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  const [tab, setTab] = useState<TabKey>("shopResources");

  const sections = useMemo(
    () => [
      {
        title: "Student Workstations",
        imageLabel: "CB 413 workstations",
        imageSrc: "/studentWorkstations.jpg",
        body: "The EPICenter has several student workstations located in CB 413. Each work station has access to soldering/desoldering tools, hand tools, oscilloscopes, signal generators, power supplies, and other specialized tools to help students with their class or personal projects. Shop techs also provide on-site training and assistance with these tools.",
      },
      {
        title: "Machine Shop",
        imageLabel: "Machine shop equipment",
        imageSrc: "/machineShop.jpg",
        body: "The machine shop provides students with access to a vinyl cutter, band saw, sander, table saws, mitre saw, drill press, metal mill and a ventilated paint booth. Equipment use requires safety training beforehand, provided through ytrain.byu.edu. (Link the training here.)",
      },
      {
        title: "Project Requests",
        imageLabel: "3D print / PCB mill / laser",
        imageSrc: "/projectRequests.jpg",
        body: "The EPICenter provides students with access to state-of-the-art machinery such as high definition 3D printers, a PCB mill, and a laser cutter. Due to the technical nature of this machinery, students wishing to use this service must submit a project request form whereupon the shop technicians will perform the needed machining.",
      },
      {
        title: "Electrical Components",
        imageLabel: "Components & hardware",
        imageSrc: "/electricalComponents.jpg",
        body: "The EPICenter has a large range of electrical components that students and faculty may purchase. Items ranging from discrete components such as capacitors and inductors to fully integrated curcuits and microcontrollers are all available. For after hours purchasing, students may use the EPICenter vending machine located at CB 423.",
      },
      {
        title: "Hardware Components",
        imageLabel: "Components & hardware",
        imageSrc: "/hardwareComponents.jpg",
        body: "The EPICenter also provides a variety of hardware components such as screws, nuts, bolts, cables, stand offs, springs, thermal couples, knobs, wheels, chains, wood, metal, plastic and paint. Office supplies are also available for purchase.",
      },
      {
        title: "Other College Resource: Project Support Center (PSC)",
        imageLabel: "Project support center",
        imageSrc: "/psc.png",
        body: " (Link Here) The PSC provides equipment checkout, sales and project support to BYU undergrad and graduate students and faculty. They also provide training and scheduling for much of the ME Department equipment such as the tensile testers, wind and water tunnels, heat treating ovens, microscopes, etc. The PSC is located in the Engineering Building room 107. Some of the items they have for checkout and/or sale: Arduino Uno/Nano, ESP32 microcontrollers, accelerometers, other microcontroller sensors, power supplies, multimeters, O-scopes, data collection systems, sensors for measuring temperature, force, flow, etc., motors, actuators, bearings, hardware, tools, and consumables like glue, tape, etc.",
      },
    ],
    [],
  );

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gray-50 px-6 py-8 sm:px-12">
      {/* Page header (same spacing pattern) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-byu-navy">
          Information & Resources
        </h1>
      </div>

      {/* ✅ 2-column layout: left tabs, right content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left sidebar tabs */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-36 space-y-3">
            <TabButton
              active={tab === "shopResources"}
              label="Shop Resources"
              onClick={() => setTab("shopResources")}
              icon={<FiTool />}
            />
            <TabButton
              active={tab === "epicenterPolicies"}
              label="EPICenter Policies"
              onClick={() => setTab("epicenterPolicies")}
              icon={<FiBookOpen />}
            />
            <TabButton
              active={tab === "locationHoursContact"}
              label="Location, Hours, & Contacts"
              onClick={() => setTab("locationHoursContact")}
              icon={<FiClock />}
            />
          </div>
        </aside>

        {/* Right content */}
        <section className="lg:col-span-9">
          {tab === "shopResources" ? (
            <div className="space-y-6">
              {sections.map((s, idx) => (
                <ResourceSection
                  key={s.title}
                  title={s.title}
                  body={s.body}
                  imageLabel={s.imageLabel}
                  imageSrc={s.imageSrc}
                  reverse={idx % 2 === 1}
                />
              ))}
            </div>
          ) : tab === "epicenterPolicies" ? (
            <PoliciesContent />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-gray-600">
                Placeholder for{" "}
                <span className="font-semibold text-byu-navy">{tab}</span>{" "}
                content.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
