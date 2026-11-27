package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.entity.MediaFile;
import com.example.locationBackEnd.repository.MediaFileRepository;
import com.example.locationBackEnd.service.FileStorageService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/media") @RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MediaController {
    private final FileStorageService storage;
    private final MediaFileRepository repo;

    public record MediaDto(String id, String ownerType, String ownerId, String kind, String review,
                           String name, String contentType, long size, LocalDateTime createdAt) {
        static MediaDto of(MediaFile f) {
            return new MediaDto(f.getId(), f.getOwnerType().name(), f.getOwnerId(), f.getKind().name(),
                    f.getReview().name(), f.getOriginalName(), f.getContentType(), f.getSize(), f.getCreatedAt());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaDto> upload(@RequestParam MultipartFile file, @RequestParam MediaFile.Owner ownerType,
                                           @RequestParam String ownerId, @RequestParam MediaFile.Kind kind) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(MediaDto.of(storage.store(file, ownerType, ownerId, kind)));
    }

    @GetMapping
    public List<MediaDto> list(@RequestParam MediaFile.Owner ownerType, @RequestParam String ownerId) {
        return repo.findByOwnerTypeAndOwnerIdOrderByCreatedAtDesc(ownerType, ownerId).stream().map(MediaDto::of).toList();
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<Resource> content(@PathVariable String id) throws IOException {
        MediaFile f = find(id);
        boolean sensitive = f.getOwnerType() == MediaFile.Owner.USER;
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(f.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(f.getStoredName()).build().toString())
                .cacheControl(sensitive ? CacheControl.noStore() : CacheControl.maxAge(Duration.ofHours(1)))
                .body((Resource) storage.load(f));
    }

    @PutMapping("/{id}/review")
    public MediaDto review(@PathVariable String id, @RequestParam MediaFile.Review value) {
        MediaFile f = find(id);
        f.setReview(value);
        return MediaDto.of(repo.save(f));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) throws IOException {
        storage.delete(find(id));
        return ResponseEntity.noContent().build();
    }

    private MediaFile find(String id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Fichier introuvable"));
    }
}