import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';

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
  const currentIds = selectedPoint.wasteTypesData?.map(w => w.id) || []; 

    setEditData({ 
        name: selectedPoint.name, 
        address: selectedPoint.address,
        wasteTypeIds: currentIds.length > 0 ? currentIds : [] 
    });
    setIsEditing(true);
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

  return (
  <div className="map-page-wrapper"> 
      <Header />
      <div className="map-container">
      <div className="map-filter">
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
        <div id="map" ref={mapRef}></div>

        {selectedPoint && (
        <div className="sidebar">
          <button className="close-btn" onClick={closeSidebar}>
            <i className='bx bx-x'></i>
          </button>

          <img src={selectedPoint.photoUrl || '/Resources/point.png'} alt="point" className="sidebar-img" />

          <div className="sidebar-content">
            {isEditing ? (
              /* ОКНО РЕДАКТИРОВАНИЯ И СОЗДАНИЯ */
              <div className="edit-form">
                
                {/* ФОТО: Показываем только если точка УЖЕ существует (не в режиме создания) */}
                {!isCreating && (
                  <div className="edit-photo-section" style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <img src={selectedPoint.photoUrl || '/Resources/point.png'} alt="preview" style={{ width: '100px', borderRadius: '8px' }} />
                    <input 
                      type="file" 
                      id="photoInput" 
                      hidden 
                      onChange={handlePhotoChange} 
                      accept="image/*"
                    />
                    <button 
                      onClick={() => document.getElementById('photoInput').click()}
                      style={{ display: 'block', margin: '10px auto', fontSize: '12px' }}
                    >
                      Сменить фото
                    </button>
                  </div>
                )}

                <label>Название:</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                />
                
                <label>Адрес:</label>
                <textarea 
                  value={editData.address} 
                  onChange={(e) => setEditData({...editData, address: e.target.value})} 
                />
                <label>Типы отходов (удерживайте Ctrl для выбора нескольких):</label>
                <select 
                  multiple={true} // Разрешаем выбирать несколько
                  style={{ height: '100px' }} // Чтобы было удобно выбирать
                  value={editData.wasteTypeIds || []}
                  onChange={(e) => {
                    // Собираем все выбранные ID в массив
                    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    setEditData({...editData, wasteTypeIds: selectedOptions});
                  }}
                >
                  {wasteTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {/* Кнопка "Сохранить" теперь универсальная */}
                <button className="btn-save" onClick={handleSaveButtonClick}>
                  {isCreating ? "Создать точку" : "Сохранить изменения"}
                </button>
                
                {/* УДАЛЕНИЕ: Показываем кнопку только если мы редактируем существующую точку */}
                {!isCreating && (
                  <button 
                    className="btn-delete" 
                    onClick={handleDeletePoint}
                    style={{ backgroundColor: '#e74c3c', color: 'white', marginTop: '10px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
                  >
                    Удалить точку
                  </button>
                )}
                
                <button className="btn-cancel" onClick={() => isCreating ? closeSidebar() : setIsEditing(false)} style={{ width: '100%', marginTop: '5px' }}>
                  Отмена
                </button>
              </div>
            ) : (
              /* ОКНО ИНФОРМАЦИИ (ПРОСМОТР) */
              <>
                <h2 className="sidebar-title">{selectedPoint.name}</h2>
                <p className="sidebar-address">
                  <i className='bx bx-map'></i> {selectedPoint.address || 'Адрес не указан'}
                </p>
                <p><strong>Типы:</strong> {displayNames || 'Не указаны'}</p>
                {isAdmin && (
                  <button className="btn-edit" onClick={startEditing} style={{ marginTop: '10px', backgroundColor: '#f39c12', color: 'white', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
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