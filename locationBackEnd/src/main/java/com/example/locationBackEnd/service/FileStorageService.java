package com.example.locationBackEnd.service;

import com.example.locationBackEnd.entity.MediaFile;
import com.example.locationBackEnd.repository.MediaFileRepository;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Map<String, String> EXT = Map.of(
            "image/jpeg", "jpg", "image/png", "png", "image/webp", "webp",
            "video/mp4", "mp4", "video/webm", "webm", "application/pdf", "pdf");

    private final Path root;
    private final MediaFileRepository repo;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String dir, MediaFileRepository repo) throws IOException {
        this.root = Path.of(dir).toAbsolutePath().normalize();
        this.repo = repo;
        Files.createDirectories(root);
    }

    public MediaFile store(MultipartFile file, MediaFile.Owner owner, String ownerId, MediaFile.Kind kind) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Fichier vide");
        String type = file.getContentType() == null ? "" : file.getContentType();
        String ext = EXT.get(type);
        if (ext == null) throw new IllegalArgumentException("Format non autorisé (JPG, PNG, WEBP, MP4, WEBM, PDF)");

        boolean video = type.startsWith("video/"), pdf = type.equals("application/pdf");
        boolean document = kind == MediaFile.Kind.LICENSE || kind == MediaFile.Kind.ID_CARD;
        if (document != (owner == MediaFile.Owner.USER)) throw new IllegalArgumentException("Type de fichier incompatible");
        if (kind == MediaFile.Kind.VIDEO && !video) throw new IllegalArgumentException("Une vidéo est attendue");
        if (kind == MediaFile.Kind.PHOTO && (video || pdf)) throw new IllegalArgumentException("Une photo est attendue");
        if (document && video) throw new IllegalArgumentException("Image ou PDF attendu");

        long max = video ? 100L << 20 : 10L << 20;
        if (file.getSize() > max) throw new IllegalArgumentException("Fichier trop volumineux (max " + (max >> 20) + " Mo)");

        String stored = UUID.randomUUID() + "." + ext;
        try (InputStream in = file.getInputStream()) { Files.copy(in, root.resolve(stored)); }

        String name = Objects.requireNonNullElse(file.getOriginalFilename(), "fichier");
        return repo.save(MediaFile.builder().ownerType(owner).ownerId(ownerId).kind(kind)
                .originalName(name.length() > 120 ? name.substring(0, 120) : name)
                .contentType(type).size(file.getSize()).storedName(stored).build());
    }

    public UrlResource load(MediaFile f) throws MalformedURLException {
        return new UrlResource(root.resolve(f.getStoredName()).toUri());
    }

    public void delete(MediaFile f) throws IOException {
        Files.deleteIfExists(root.resolve(f.getStoredName()));
        repo.delete(f);
    }
}
