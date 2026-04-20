import { useState } from "react";
import axios from "axios";
import { ArrowRight, Scale, Server, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow, ROLE_OPTIONS } from "./shared";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactSection() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid corporate email";
    if (!form.role) e.role = "Select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const roleLabel =
        ROLE_OPTIONS.find((r) => r.value === form.role)?.label || form.role;
      await axios.post(`${API}/pilot-requests`, {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        corporate_email: form.email.trim(),
        role: roleLabel,
      });
      toast.success("Pilot assessment request received.", {
        description:
          "A member of the team will respond within 1 business day.",
      });
      setForm({ firstName: "", lastName: "", email: "", role: "" });
      setErrors({});
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not submit the request. Please try again.";
      toast.error("Submission failed.", { description: String(detail) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative border-t border-slate-900 bg-slate-950 py-24 sm:py-28"
      data-testid="contact-section"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <div className="reveal rounded-lg border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow index="06">Intake</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Initiate a Pilot Assessment
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                Request a 20-minute architecture fit-call. Our 4-to-6 week paid
                enterprise pilots require zero API integration with your HRIS.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  20-minute architecture fit-call
                </li>
                <li className="flex items-start gap-3">
                  <Server className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  Zero HRIS API integration required
                </li>
                <li className="flex items-start gap-3">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  EU-sovereign data flows throughout
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="lg:col-span-7"
              data-testid="pilot-form"
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="Levi"
                    data-testid="input-first-name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="Hankins"
                    data-testid="input-last-name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Corporate Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-500"
                    placeholder="name@enterprise.com"
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="role"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 mono"
                  >
                    Role
                  </Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                  >
                    <SelectTrigger
                      id="role"
                      className="mt-2 h-11 border-slate-800 bg-slate-950 text-slate-100 focus:ring-cyan-500"
                      data-testid="select-role-trigger"
                    >
                      <SelectValue placeholder="Select your function" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="focus:bg-slate-800 focus:text-white"
                          data-testid={`select-role-option-${opt.value}`}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-rose-400">{errors.role}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="btn-glow mt-8 h-11 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 sm:w-auto"
                data-testid="submit-pilot-form"
              >
                {submitting ? "Submitting…" : "Request Pilot Assessment"}
                {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>

              <p className="mt-4 text-xs text-slate-500">
                By submitting, you consent to Third Rail Systems OÜ processing
                the information above solely to evaluate pilot fit. No
                special-category data is requested.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
