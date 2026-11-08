import { useId, useRef, useState } from "react";
import { uploadMovieImage } from "../../service/admin";
import { getErrorMessage } from "../../service/errorMessage";
import { safeImageUrl } from "../../utils/media";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Image picker for the record forms. Uploads the chosen file to Supabase (through the
// backend) and stores the returned public URL as the field value. A link can also be pasted.
//   kind: "poster" | "banner"   (decides the folder in storage and the preview shape)
export default function ImageField({ label, kind = "poster", value, onChange, error, hint, optional, className = "" }) {
  const id = useId();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [broken, setBroken] = useState("");

  const src = safeImageUrl(value);
  const showPreview = src && broken !== src;
  const message = uploadError || error;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again
    if (!file) return;

    if (!TYPES.includes(file.type)) return setUploadError("Choose a JPG, PNG or WebP image.");
    if (file.size > MAX_BYTES) return setUploadError("The image must be 5 MB or smaller.");

    setUploadError("");
    setUploading(true);
    try {
      const res = await uploadMovieImage(file, kind);
      onChange(res.data.url);
    } catch (err) {
      setUploadError(getErrorMessage(err, "Could not upload the image. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const previewShape = kind === "banner" ? "aspect-video w-full max-w-[220px]" : "aspect-[2/3] w-24";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-200">
        {label}
        {optional && <span className="text-xs font-normal text-gray-500">Optional</span>}
      </label>

      <div className={`flex gap-4 rounded-lg border bg-[#0b0f19] p-3 ${message ? "border-rose-500/70" : "border-white/10"}`}>
        <div className={`${previewShape} relative shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10`}>
          {showPreview ? (
            <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setBroken(src)} className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center px-2 text-center text-xs text-gray-500">
              {src ? "Image could not be loaded" : "No image"}
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-black/60">
              <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept={TYPES.join(",")} onChange={handleFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
          </div>

          <input
            id={id}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image link (https://…)"
            aria-invalid={Boolean(message)}
            className="h-9 w-full rounded-md border border-white/10 bg-[#111827] px-3 text-xs text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>
      </div>

      {message ? (
        <p role="alert" className="mt-1.5 text-xs text-rose-300">{message}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}