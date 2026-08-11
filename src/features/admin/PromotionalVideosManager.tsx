// ─────────────────────────────────────────────────────────────────
// PromotionalVideosManager — Admin Dashboard Management UI
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promoVideoService } from "@/services/promo-video.service";
import type {
  PromotionalVideo,
  CreatePromoVideoInput,
  VideoAspectRatio,
} from "@/types/promo-video.types";
import { CATEGORY_LIST } from "@/lib/categories.data";
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart2,
  Play,
  Film,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  Volume2,
  RotateCw,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function PromotionalVideosManager() {
  const [videos, setVideos] = useState<PromotionalVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<PromotionalVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<PromotionalVideo | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [ctaText, setCtaText] = useState("Explore Templates");
  const [ctaUrl, setCtaUrl] = useState("/templates");
  const [category, setCategory] = useState("global");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(0);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [muted, setMuted] = useState(true);
  const [loop, setLoop] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const loadVideos = async () => {
    setLoading(true);
    try {
      const list = await promoVideoService.getAllVideosAdmin();
      setVideos(list);
    } catch (err) {
      toast.error("Failed to load promotional videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVideos();
  }, []);

  const openCreateModal = () => {
    setEditingVideo(null);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setPosterUrl("");
    setCtaText("Explore Templates");
    setCtaUrl("/templates");
    setCategory("global");
    setAspectRatio("16:9");
    setIsActive(true);
    setPriority(0);
    setDisplayOrder(0);
    setAutoplay(true);
    setMuted(true);
    setLoop(true);
    setStartAt("");
    setEndAt("");
    setIsModalOpen(true);
  };

  const openEditModal = (video: PromotionalVideo) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description || "");
    setVideoUrl(video.video_url);
    setPosterUrl(video.poster_url || "");
    setCtaText(video.cta_text || "Explore Templates");
    setCtaUrl(video.cta_url || "/templates");
    setCategory(video.category || "global");
    setAspectRatio(video.aspect_ratio || "16:9");
    setIsActive(video.is_active);
    setPriority(video.priority);
    setDisplayOrder(video.display_order);
    setAutoplay(video.autoplay);
    setMuted(video.muted);
    setLoop(video.loop);
    setStartAt(video.start_at ? video.start_at.slice(0, 16) : "");
    setEndAt(video.end_at ? video.end_at.slice(0, 16) : "");
    setIsModalOpen(true);
  };

  // Video File Upload Handler
  const handleVideoFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStage("Validating video file...");
    setUploadProgress(15);

    try {
      setUploadStage("Uploading to cloud storage...");
      const url = await promoVideoService.uploadMediaFile(file, "videos", (p) => {
        setUploadProgress(p);
        if (p < 50) setUploadStage(`Uploading ${p}%`);
        else if (p < 85) setUploadStage("Processing video frames...");
        else setUploadStage("Optimizing playback stream...");
      });

      setVideoUrl(url);
      setUploadStage("Ready ✓");
      toast.success("Video uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  // Poster Image Upload Handler
  const handlePosterFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await promoVideoService.uploadMediaFile(file, "posters");
      setPosterUrl(url);
      toast.success("Poster image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload poster image");
    }
  };

  const handleToggleActive = async (video: PromotionalVideo) => {
    try {
      await promoVideoService.updateVideo({
        id: video.id,
        is_active: !video.is_active,
      });
      toast.success(`Video ${!video.is_active ? "enabled" : "disabled"}`);
      void loadVideos();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional video?")) return;

    try {
      await promoVideoService.deleteVideo(id);
      toast.success("Promotional video deleted");
      void loadVideos();
    } catch (err) {
      toast.error("Failed to delete video");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!videoUrl.trim()) return toast.error("Video URL or upload is required");

    const payload: CreatePromoVideoInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      video_url: videoUrl.trim(),
      poster_url: posterUrl.trim() || undefined,
      cta_text: ctaText.trim() || "Explore Templates",
      cta_url: ctaUrl.trim() || "/templates",
      category,
      aspect_ratio: aspectRatio,
      is_active: isActive,
      priority: Number(priority) || 0,
      display_order: Number(displayOrder) || 0,
      autoplay,
      muted,
      loop,
      start_at: startAt ? new Date(startAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
    };

    try {
      if (editingVideo) {
        await promoVideoService.updateVideo({ id: editingVideo.id, ...payload });
        toast.success("Promotional video updated!");
      } else {
        await promoVideoService.createVideo(payload);
        toast.success("Promotional video created!");
      }
      setIsModalOpen(false);
      void loadVideos();
    } catch (err: any) {
      toast.error(err.message || "Failed to save video");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-ivory/10">
        <div>
          <div className="flex items-center gap-2">
            <Film className="text-gold" size={24} />
            <h2 className="font-display text-2xl text-ivory">Promotional Videos</h2>
          </div>
          <p className="text-ivory/60 text-xs mt-1">
            Manage video ads and promotional showcases rendered inside the browser preview frame across LoveCraft.ai.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs label-caps transition-all shadow-lg shadow-gold/20"
        >
          <Plus size={16} /> Add Promotional Video
        </button>
      </div>

      {/* Videos List Table */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="animate-spin text-gold mx-auto mb-3" size={32} />
          <p className="text-ivory/50 text-xs label-caps">Loading promotional videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-ivory/10">
          <Film className="text-ivory/20 mx-auto mb-4" size={48} />
          <h3 className="font-display text-xl text-ivory mb-2">No Promotional Videos</h3>
          <p className="text-ivory/60 text-sm max-w-md mx-auto mb-6">
            Upload your first promo video (e.g. Raksha Bandhan, Love Story Showcase). The frontend will automatically display it in place of the static homepage preview frame.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-charcoal font-bold text-xs label-caps"
          >
            <Plus size={16} /> Upload First Video
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl overflow-hidden border border-ivory/10 flex flex-col justify-between group hover:border-gold/30 transition-all"
            >
              {/* Media Header */}
              <div className="relative aspect-video bg-charcoal overflow-hidden">
                {video.poster_url ? (
                  <img
                    src={video.poster_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <video
                    src={video.video_url}
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full label-caps text-[9px] font-bold ${
                      video.is_active
                        ? "bg-emerald-500/90 text-white shadow-md"
                        : "bg-charcoal/80 text-ivory/50 border border-ivory/10"
                    }`}
                  >
                    {video.is_active ? "Active" : "Disabled"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-charcoal/80 text-gold border border-gold/30 label-caps text-[9px] capitalize">
                    {video.category}
                  </span>
                </div>

                {/* Priority Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-charcoal/80 text-ivory/70 border border-ivory/10 label-caps text-[9px]">
                  Priority: {video.priority}
                </div>

                {/* Preview Trigger */}
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="absolute inset-0 grid place-items-center bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="w-12 h-12 rounded-full bg-gold text-charcoal grid place-items-center shadow-xl">
                    <Play size={20} className="translate-x-0.5 fill-current" />
                  </span>
                </button>
              </div>

              {/* Details Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg text-ivory group-hover:text-gold transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-ivory/60 text-xs mt-1 line-clamp-2">{video.description}</p>
                  )}
                  {video.cta_text && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] label-caps text-gold">
                      <span>CTA: {video.cta_text}</span>
                      <ExternalLink size={10} />
                    </div>
                  )}
                </div>

                {/* Analytics Snapshot */}
                {video.analytics && (
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-ivory/10 text-center">
                    <div>
                      <div className="text-[9px] label-caps text-ivory/40">Views</div>
                      <div className="text-xs font-bold text-ivory">{video.analytics.impressions}</div>
                    </div>
                    <div>
                      <div className="text-[9px] label-caps text-ivory/40">Plays</div>
                      <div className="text-xs font-bold text-ivory">{video.analytics.plays}</div>
                    </div>
                    <div>
                      <div className="text-[9px] label-caps text-ivory/40">CTR</div>
                      <div className="text-xs font-bold text-gold">
                        {video.analytics.ctr.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] label-caps text-ivory/40">Clicks</div>
                      <div className="text-xs font-bold text-emerald-400">
                        {video.analytics.cta_clicks}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-3 border-t border-ivory/10">
                  <button
                    onClick={() => void handleToggleActive(video)}
                    className={`text-xs label-caps font-semibold flex items-center gap-1.5 transition-colors ${
                      video.is_active ? "text-emerald-400 hover:text-emerald-300" : "text-ivory/40 hover:text-ivory"
                    }`}
                  >
                    {video.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {video.is_active ? "Enabled" : "Disabled"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(video)}
                      className="p-2 rounded-lg bg-ivory/5 hover:bg-ivory/15 text-ivory/70 hover:text-ivory transition-all"
                      title="Edit Metadata"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => void handleDelete(video.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                      title="Delete Video"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-ivory/10 bg-charcoal space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                <h3 className="font-display text-2xl text-ivory">
                  {editingVideo ? "Edit Promotional Video" : "Upload Promotional Video"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-ivory/50 hover:text-ivory hover:bg-ivory/10 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload Dropzone */}
                <div>
                  <label className="block text-xs label-caps text-ivory/70 mb-2">
                    Video File (MP4, WebM, MOV) *
                  </label>
                  <div className="border-2 border-dashed border-ivory/20 hover:border-gold/50 rounded-2xl p-6 text-center transition-colors bg-charcoal/50 relative">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto mb-2 text-gold" size={28} />
                    <p className="text-xs text-ivory/80">
                      {videoUrl ? "Video Uploaded ✓ Click to replace" : "Drag & drop or click to upload video file"}
                    </p>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="mt-4 space-y-2 max-w-xs mx-auto">
                        <div className="h-2 w-full bg-ivory/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] label-caps text-gold">{uploadStage}</p>
                      </div>
                    )}
                  </div>
                  {videoUrl && (
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Video URL"
                      className="mt-2 w-full px-4 py-2 text-xs rounded-xl bg-ivory/5 border border-ivory/10 text-ivory/70"
                    />
                  )}
                </div>

                {/* Poster Image Upload */}
                <div>
                  <label className="block text-xs label-caps text-ivory/70 mb-2">
                    Poster Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterFileUpload}
                      className="text-xs text-ivory/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-charcoal hover:file:bg-gold-light cursor-pointer"
                    />
                    {posterUrl && (
                      <img src={posterUrl} alt="Poster" className="w-12 h-12 object-cover rounded-lg border border-ivory/20" />
                    )}
                  </div>
                </div>

                {/* Title & Category Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Raksha Bandhan Collection"
                      className="w-full px-4 py-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    >
                      <option value="global">Global (Homepage)</option>
                      {CATEGORY_LIST.filter((c) => c.id !== "all").map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.emoji})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs label-caps text-ivory/70 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for the video overlay..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                  />
                </div>

                {/* CTA Settings */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Explore Templates"
                      className="w-full px-4 py-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">CTA Destination URL</label>
                    <input
                      type="text"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="/templates/raksha-bandhan"
                      className="w-full px-4 py-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Priority & Aspect Ratio */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">Priority Order (Higher = First)</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-ivory/5 border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs label-caps text-ivory/70 mb-1">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                      className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-ivory/10 text-ivory text-sm focus:border-gold outline-none"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait / Reel)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:5">4:5 (Social)</option>
                    </select>
                  </div>
                </div>

                {/* Video Playback Toggles */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-ivory/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="rounded accent-gold"
                    />
                    Autoplay
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ivory/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={muted}
                      onChange={(e) => setMuted(e.target.checked)}
                      className="rounded accent-gold"
                    />
                    Muted by default
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ivory/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="rounded accent-gold"
                    />
                    Loop video
                  </label>

                  <label className="flex items-center gap-2 text-xs text-ivory/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded accent-gold"
                    />
                    Active / Published
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-ivory/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-ivory/20 text-ivory/60 hover:text-ivory text-xs label-caps"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gold text-charcoal font-bold text-xs label-caps hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
                  >
                    {editingVideo ? "Update Video" : "Save Promotional Video"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {previewVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xl glass-panel rounded-3xl p-6 border border-ivory/10 bg-charcoal space-y-4"
            >
              <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                <h4 className="font-display text-lg text-ivory">{previewVideo.title}</h4>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="p-1 rounded-full text-ivory/50 hover:text-ivory"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src={previewVideo.video_url}
                  poster={previewVideo.poster_url || undefined}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs text-ivory/70 space-y-1">
                <div>Category: <span className="text-gold capitalize">{previewVideo.category}</span></div>
                <div>CTA: <span className="text-ivory">{previewVideo.cta_text} → {previewVideo.cta_url}</span></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
