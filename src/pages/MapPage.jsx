import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';

const MapPage = () => {
  const mapRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
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

    async function fetchPoints(map) {
      try {
        const response = await api.get('/disposalpoints'); 
        const points = response.data;
        points.forEach(p => addPlacemark(map, p));
      } catch (e) { console.error(e); }
    }
    async function savePointOnServer(map, coords, type, imageFile) {
      try {
        const formData = new FormData();
        // Костыль: превращаем в строку и меняем точку на запятую
        const latWithComma = coords[0].toString().replace('.', ',');
        const lonWithComma = coords[1].toString().replace('.', ',');
        
        formData.append('Name', `Точка: ${type}`);
        formData.append('Latitude', latWithComma);
        formData.append('Longitude', lonWithComma);
        formData.append('Address', 'Адрес из геокодера или промпта');
      
        if (imageFile) {
          formData.append('image', imageFile); 
        }

        const response = await api.post('/disposalpoints', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' 
          }
        });

        if (response.status === 201) {
          addPlacemark(map, response.data);
          alert("Точка и фото успешно сохранены!");
        }
      } catch (e) {
        console.error("Ошибка сохранения:", e.response?.data || e.message);
        alert("Не удалось сохранить точку с фото");
      }
    }

    function addPlacemark(map, point) {
      const typesText = point.wasteTypes && point.wasteTypes.length > 0 
        ? point.wasteTypes.join(', ') 
        : "Общий";

      const placemark = new window.ymaps.Placemark([point.latitude, point.longitude], {
        hintContent: point.type || "Точка сбора",
        balloonContent: `
          <div>
            <strong>${point.name || 'Точка сбора'}</strong><br/>
            <b>Адрес:</b> ${point.address || 'Не указан'}<br/>
            <b>Типы:</b> ${typesText}
          </div>
        `
      },
      {
        iconLayout: 'default#image',
        iconImageHref: '/Resources/point.png',
        iconImageSize: [30,40],
        iconImagrOffset: [-15,-40],
        hasBalloon: false

      }
    );
      placemark.events.add('click', () => {
        console.log("Клик по точке:", point)
        setSelectedPoint({
          ...point,
          displayTypes: typesText
        });
      });
    
    
      map.geoObjects.add(placemark);
    }
  }, [isAdmin]);

  return (
  <div className="map-page-wrapper"> 
    <Header />
    <div className="map-container">
      <div id="map" ref={mapRef}></div>

      {selectedPoint && ( 
        <div className="sidebar">
          <button className="close-btn" src ={'/Resources/close.png'} onClick={() => setSelectedPoint(null)}>
            <i className='bx bx-x'></i>
          </button>
          <img src={selectedPoint.img || '/Resources/point.png'} alt="point" className="sidebar-img" />
          <div className="sidebar-content">
            <h2 className="sidebar-title">{selectedPoint.type}</h2>
            <p className="sidebar-address">
              <i className='bx bx-map'></i> {selectedPoint.address || 'Адрес не указан'}
            </p>
            <div className="points-pill">
              <i className='bx bxs-zap'></i> +{selectedPoint.points || 0} баллов
            </div>
            <button className="btn-save" style={{ width: '100%', marginTop: '10px' }}>
              Подтвердить сбор
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default MapPage;