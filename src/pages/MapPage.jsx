import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';

const MapPage = () => {
  const mapRef = useRef(null);
  const yMap = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editData, setEditData] = useState({});
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
      fetchPoints(map);

      if (isAdmin) {
        map.events.add('dblclick', async (e) => {
          const coords = e.get('coords');
          const type = prompt("Тип точки (Пластик, Бумага):", "Общий");
          if(type){
            await savePointOnServer(map, coords, type, null);
          }
        });
      }
    }
  }, [isAdmin]);

  const fetchPoints = async (map) => {
    try {
      map.geoObjects.removeAll(); // Очистка перед перерисовкой
      const response = await api.get('/disposalpoints'); 
      response.data.forEach(p => addPlacemark(map, p));
    } catch (e) { console.error(e); }
  };

  const addPlacemark = (map, point) => {
    const typesText = point.wasteTypes?.length > 0 ? point.wasteTypes.join(', ') : "Общий";

    const placemark = new window.ymaps.Placemark([point.latitude, point.longitude], {
      hintContent: point.name
    }, {
      iconLayout: 'default#image',
      iconImageHref: '/Resources/point.png',
      iconImageSize: [30, 40],
      iconImageOffset: [-15, -40]
    });

    placemark.events.add('click', () => {
      setSelectedPoint({ ...point, displayTypes: typesText });
      setIsEditing(false); 
    });

    map.geoObjects.add(placemark);
  };

  // ФУНКЦИЯ ОБНОВЛЕНИЯ
  const handleUpdatePoint = async () => {
    try {
      await api.put(`/disposalpoints/${selectedPoint.id}`, {
        id: selectedPoint.id,
        name: editData.name,
        address: editData.address,
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude
      });

      alert("Данные обновлены!");
      setIsEditing(false);
      setSelectedPoint({ ...selectedPoint, name: editData.name, address: editData.address });
      fetchPoints(yMap.current); // Обновляем карту
    } catch (e) {
      console.error(e);
      alert("Ошибка при обновлении");
    }
  };

  const startEditing = () => {
    setEditData({ name: selectedPoint.name, address: selectedPoint.address });
    setIsEditing(true);
  };

  return (
  <div className="map-page-wrapper"> 
      <Header />
      <div className="map-container">
        <div id="map" ref={mapRef}></div>

        {selectedPoint && ( 
          <div className="sidebar">
            <button className="close-btn" onClick={() => setSelectedPoint(null)}>
              <i className='bx bx-x'></i>
            </button>
            
            <img src={selectedPoint.photoUrl || '/Resources/point.png'} alt="point" className="sidebar-img" />
            
            <div className="sidebar-content">
              {isEditing ? (
                /* ОКНО РЕДАКТИРОВАНИЯ */
                <div className="edit-form">
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
                  <button className="btn-save" onClick={handleUpdatePoint}>Сохранить</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
              ) : (
                /* ОКНО ИНФОРМАЦИИ */
                <>
                  <h2 className="sidebar-title">{selectedPoint.name}</h2>
                  <p className="sidebar-address">
                    <i className='bx bx-map'></i> {selectedPoint.address || 'Адрес не указан'}
                  </p>
                  <p><strong>Типы:</strong> {selectedPoint.displayTypes}</p>
                  
                  <div className="points-pill">
                    <i className='bx bxs-zap'></i> +{selectedPoint.points || 0} баллов
                  </div>

                  {isAdmin && (
                    <button className="btn-edit" onClick={startEditing} style={{ marginTop: '10px', backgroundColor: '#f39c12', color: 'white', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      <i className='bx bx-edit'></i> Редактировать точку
                    </button>
                  )}
                  
                  <button className="btn-save" style={{ width: '100%', marginTop: '10px' }}>
                    Подтвердить сбор
                  </button>
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