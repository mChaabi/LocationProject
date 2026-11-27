package com.example.locationBackEnd.repository;

import com.example.locationBackEnd.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaFileRepository extends JpaRepository<MediaFile, String> {
    List<MediaFile> findByOwnerTypeAndOwnerIdOrderByCreatedAtDesc(MediaFile.Owner ownerType, String ownerId);
}
