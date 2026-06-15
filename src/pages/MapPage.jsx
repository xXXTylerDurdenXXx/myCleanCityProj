import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import s from './MapPage.module.css';

const PLACEHOLDER = '/Resources/point.png';

const hasRealPhoto = (url) => url && !url.includes('point.png');

const MapPage = () => {
  const mapRef = useRef(null);
  const yMap = useRef(null);
  const [points, setPoints] = useState([]);
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [isCreating, setIsCreating] = useState(false);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [editData, setEditData] = useState({});
  const [newCoords, setNewCoords] = useState(null);
  const token = localStorage.getItem('token');

  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
  };

  const user = parseJwt(token);
  const isAdmin = (user?.role === "Admin" || user?.role === "Moderator");

  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const res = await api.get('/disposalpoints/waste-types-list'); 
        setWasteTypes(res.data);
      } catch (e) { console.error("Ошибка загрузки типов:", e); }
    };
    fetchWasteTypes();
  }, []);

  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(initMap);
    }

    async function initMap() {
      if (mapRef.current.innerHTML !== "") return;

      const map = new window.ymaps.Map(mapRef.current, {
        center: [51.7682, 55.0968],
        zoom: 13,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      yMap.current = map;
      map.behaviors.disable('doubleClickZoom');
      await fetchPoints(map);

      if (isAdmin) {
        map.events.add('dblclick', async (e) => {
          const coords = e.get('coords');
          let foundAddress = "Адрес не определен";

          try {
            const res = await window.ymaps.geocode(coords);
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) foundAddress = firstGeoObject.getAddressLine();
          } catch (err) {
            console.warn("Геокодирование недоступно:", err);
          }

          setNewCoords(coords);
          setIsCreating(true);
          setIsEditing(true);
          const initialWasteTypeId = wasteTypes.length > 0 ? wasteTypes[0].id : 0;

          const initialData = {
            name: "Новая точка",
            address: foundAddress,
            wasteTypeIds: initialWasteTypeId ? [initialWasteTypeId] : []
          };
          
          setSelectedPoint({ ...initialData, id: null, photoUrl: null });
          setEditData(initialData);
          
        });
      }
    }
  }, [isAdmin, wasteTypes]);

  useEffect(() => {
    if (!yMap.current) return;

    const map = yMap.current;

    map.geoObjects.removeAll();

    const filteredPoints = selectedWasteType
      ? points.filter(point =>
          point.wasteTypeNames?.includes(selectedWasteType)
        )
      : points;

    filteredPoints.forEach(point => addPlacemark(map, point));

  }, [points, selectedWasteType]);

  
  const fetchPoints = async () => {
    try {
      const response = await api.get('/disposalpoints');
      setPoints(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveButtonClick = async () => {
    if (isCreating) {
      await savePointOnServer(yMap.current, newCoords, editData.address);
    } else {
      await handleUpdatePoint();
    }
  };

  const savePointOnServer = async (map, coords, address = "") => {
    try {
    const formData = new FormData();
        
        formData.append('Name', editData.name || "Точка");
        formData.append('Latitude', coords[0]);
        formData.append('Longitude', coords[1]);
        (editData.wasteTypeIds || []).forEach((id, index) => {
            formData.append(
                `DisposalPointWasteTypes[${index}].WasteTypeId`,
                id
            );
        });
        console.log(editData.wasteTypeIds);
        formData.append('Address', address);
      
        

        const response = await api.post('/disposalpoints', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' 
          }
        });

        if (response.status === 201 || response.status === 200) {
          await fetchPoints();
          alert("Точка и фото успешно сохранены!");
          setIsCreating(false);
          setIsEditing(false);
          setSelectedPoint(null);
          await fetchPoints();
          }
      } catch (e) {
        console.error("Ошибка сохранения:", e.response?.data || e.message);
        alert("Не удалось сохранить точку с фото");
      }
    }

  const addPlacemark = (map, point) => {
    const placemark = new window.ymaps.Placemark([point.latitude, point.longitude], {
      hintContent: point.name
    }, {
      iconLayout: 'default#image',
      iconImageHref: '/Resources/point.png',
      iconImageSize: [30, 40],
      iconImageOffset: [-15, -40]
    });

    placemark.events.add('click', () => {
      setSelectedPoint(point);
      setIsEditing(false);
      setIsCreating(false);
    });

    map.geoObjects.add(placemark);
  };

  // ФУНКЦИЯ ОБНОВЛЕНИЯ
  const handleUpdatePoint = async () => {
  try {
    const dataToSend = {
      id: selectedPoint.id,
      name: editData.name,
      address: editData.address,
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
      disposalPointWasteTypes: (editData.wasteTypeIds || []).map(id => ({
        wasteTypeId: id
      }))
    };

    console.log("Отправка на PUT:", dataToSend);
    await api.put(`/disposalpoints/${selectedPoint.id}`, dataToSend);

    alert("Данные обновлены!");
    setIsEditing(false);
    await fetchPoints(); 
    
    // Сбрасываем выбранную точку, чтобы данные подтянулись заново
    setSelectedPoint(null); 
  } catch (e) {
    console.error("Детали ошибки 400:", e.response?.data);
    alert("Ошибка 400: проверьте правильность заполнения полей");
  }
  };
  const closeSidebar = () => {
    setSelectedPoint(null);
    setIsEditing(false);
    setIsCreating(false);
    setEditData({});
  };
  const startEditing = () => {
    let currentIds = selectedPoint.wasteTypesData?.map(w => w.id) || [];
    if (currentIds.length === 0 && selectedPoint.wasteTypeNames?.length) {
      currentIds = wasteTypes
        .filter((wt) => selectedPoint.wasteTypeNames.includes(wt.name))
        .map((wt) => wt.id);
    }

    setEditData({
      name: selectedPoint.name,
      address: selectedPoint.address,
      wasteTypeIds: currentIds,
    });
    setIsEditing(true);
  };

  const toggleWasteType = (id) => {
    const ids = (editData.wasteTypeIds || []).map(String);
    const strId = String(id);
    const next = ids.includes(strId)
      ? ids.filter((i) => i !== strId)
      : [...ids, strId];
    setEditData({ ...editData, wasteTypeIds: next });
  };

  const handleDeletePoint = async () => {
    if (!window.confirm(`Удалить точку "${selectedPoint.name}"?`)) return;
    try {
      await api.delete(`/disposalPoints/${selectedPoint.id}`);
      alert("Точка удалена");
      closeSidebar();
      await fetchPoints();
    } catch (e) { alert("Ошибка при удалении"); }
  };

  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(`/disposalPoints/${selectedPoint.id}/upload-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Обновляем состояние, чтобы картинка сразу поменялась
    setSelectedPoint({ ...selectedPoint, photoUrl: response.data.photoUrl });
    alert("Фото обновлено");
  } catch (e) {
    alert("Ошибка при загрузке фото");
  }
};
 const displayNames = selectedPoint?.wasteTypeNames?.join(", ") || "Не указаны";
 const typeNamesList = selectedPoint?.wasteTypeNames?.length
   ? selectedPoint.wasteTypeNames
   : displayNames !== 'Не указаны' ? displayNames.split(', ') : [];
 const pointImage = selectedPoint?.photoUrl || PLACEHOLDER;

  return (
  <div className={s.mapPageWrapper}> 
      <Header />
      <div className={s.mapContainer}>
      <div className={s.mapFilter}>
          <select
            value={selectedWasteType}
            onChange={(e) => setSelectedWasteType(e.target.value)}
          >
            <option value="">Все типы</option>

            {wasteTypes.map(type => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className={s.mapEl} ref={mapRef}></div>

        {selectedPoint && (
        <div className={s.sidebar}>
          <button className={s.closeBtn} onClick={closeSidebar} aria-label="Закрыть">
            <i className='bx bx-x'></i>
          </button>

          {!isEditing && (
            <div className={`${s.photoWrap} ${hasRealPhoto(selectedPoint.photoUrl) ? s.photoReal : s.photoPlaceholder}`}>
              <img src={pointImage} alt={selectedPoint.name} />
            </div>
          )}

          <div className={s.sidebarBody}>
            {isEditing ? (
              <div className={s.editForm}>
                <div>
                  <p className={s.modeLabel}>{isCreating ? 'Создание' : 'Редактирование'}</p>
                  <h2 className={s.title}>{isCreating ? 'Новая точка' : editData.name || selectedPoint.name}</h2>
                </div>

                {!isCreating && (
                  <div className={`${s.photoEdit} ${!hasRealPhoto(selectedPoint.photoUrl) ? s.photoEditPlaceholder : ''}`}>
                    <img src={pointImage} alt="preview" />
                    <input
                      type="file"
                      id="photoInput"
                      hidden
                      onChange={handlePhotoChange}
                      accept="image/*"
                    />
                    <button
                      type="button"
                      className={s.btnPhoto}
                      onClick={() => document.getElementById('photoInput').click()}
                    >
                      <i className='bx bx-image-add'></i> Сменить фото
                    </button>
                  </div>
                )}

                <div className={s.field}>
                  <label>Название</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>

                <div className={s.field}>
                  <label>Адрес</label>
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>

                <div className={s.field}>
                  <label>Типы отходов</label>
                  <div className={s.chipGroup}>
                    {wasteTypes.map((t) => {
                      const active = (editData.wasteTypeIds || []).map(String).includes(String(t.id));
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`${s.chip} ${active ? s.chipActive : ''}`}
                          onClick={() => toggleWasteType(t.id)}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={s.formActions}>
                  <button type="button" className={s.btnSave} onClick={handleSaveButtonClick}>
                    {isCreating ? 'Создать точку' : 'Сохранить изменения'}
                  </button>
                  {!isCreating && (
                    <button type="button" className={s.btnDelete} onClick={handleDeletePoint}>
                      Удалить точку
                    </button>
                  )}
                  <button
                    type="button"
                    className={s.btnCancel}
                    onClick={() => isCreating ? closeSidebar() : setIsEditing(false)}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className={s.title}>{selectedPoint.name}</h2>
                <p className={s.address}>
                  <i className='bx bx-map'></i>
                  <span>{selectedPoint.address || 'Адрес не указан'}</span>
                </p>
                <div className={s.typesSection}>
                  <div className={s.typesLabel}>Типы</div>
                  <div className={s.typeBadges}>
                    {typeNamesList.length > 0 ? (
                      typeNamesList.map((name) => (
                        <span key={name} className={s.typeBadge}>{name}</span>
                      ))
                    ) : (
                      <span className={s.typeBadgeEmpty}>Не указаны</span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button type="button" className={s.btnEdit} onClick={startEditing}>
                    <i className='bx bx-edit'></i> Редактировать точку
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
);
};

export default MapPage;